import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Readable, PassThrough } from 'stream';
import Codegen = require('stream-audio-fingerprint');
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
import {
  FingerprintResultDto,
  DuplicateMatchDto,
  CheckDuplicatesResultDto,
} from './dto';

// Configure ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath.path);

@Injectable()
export class FingerprintingService {
  private readonly logger = new Logger(FingerprintingService.name);
  private readonly DEFAULT_SAMPLE_RATE = 22050;
  private readonly DEFAULT_THRESHOLD = 80; // 80% similarity threshold

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Decode audio buffer to PCM format
   * @param audioBuffer - Audio file buffer (MP3/WAV/etc)
   * @returns PCM audio stream
   */
  private async decodeAudio(audioBuffer: Buffer): Promise<Readable> {
    return new Promise((resolve, reject) => {
      const inputStream = Readable.from(audioBuffer);
      const outputStream = new PassThrough();

      ffmpeg(inputStream)
        .toFormat('s16le') // 16-bit signed little-endian PCM
        .audioChannels(1) // Mono
        .audioFrequency(this.DEFAULT_SAMPLE_RATE) // Resample to 22050 Hz
        .on('error', (error) => {
          this.logger.error('Audio decoding error:', error.message);
          reject(new Error(`Audio decoding failed: ${error.message}`));
        })
        .on('start', () => {
          this.logger.log('Audio decoding started...');
        })
        .pipe(outputStream);

      resolve(outputStream);
    });
  }

  /**
   * Generate audio fingerprint from audio buffer
   * @param audioBuffer - Audio file buffer
   * @returns Fingerprint data
   */
  async generateFingerprint(
    audioBuffer: Buffer,
  ): Promise<FingerprintResultDto> {
    try {
      this.logger.log('Starting fingerprint generation...');

      // Step 1: Decode audio to PCM format
      const pcmStream = await this.decodeAudio(audioBuffer);

      // Step 2: Create fingerprint stream using new Codegen()
      const fingerprintStream = new Codegen({
        frequencyBandEdges: [200, 400, 800, 1600, 3200, 6400], // Frequency bands
        sampleRate: this.DEFAULT_SAMPLE_RATE,
      });

      // Step 3: Collect landmarks
      const landmarks: any[] = [];

      return new Promise((resolve, reject) => {
        fingerprintStream.on('data', (landmark) => {
          landmarks.push(landmark);
        });

        fingerprintStream.on('end', () => {
          this.logger.log(
            `Fingerprint generated with ${landmarks.length} landmarks`,
          );

          if (landmarks.length === 0) {
            reject(new Error('No landmarks generated - audio may be invalid'));
            return;
          }

          resolve({
            fingerprint: landmarks,
            duration: landmarks.length > 0 ? Math.ceil(landmarks.length / 10) : 0, // Estimate duration
            sampleRate: this.DEFAULT_SAMPLE_RATE,
          });
        });

        fingerprintStream.on('error', (error) => {
          this.logger.error('Fingerprint generation error:', error);
          reject(error);
        });

        // Step 4: Pipe decoded PCM audio to fingerprint processor
        pcmStream.pipe(fingerprintStream);
      });
    } catch (error) {
      this.logger.error('Failed to generate fingerprint:', error.message);
      throw new Error(`Fingerprint generation failed: ${error.message}`);
    }
  }

  /**
   * Store fingerprint in database
   * @param songId - Song ID
   * @param fingerprintData - Fingerprint data
   */
  async storeFingerprint(
    songId: string,
    fingerprintData: FingerprintResultDto,
  ): Promise<void> {
    try {
      await this.prisma.audioFingerprint.create({
        data: {
          songId,
          fingerprint: JSON.stringify(fingerprintData.fingerprint),
          duration: fingerprintData.duration,
          sampleRate: fingerprintData.sampleRate,
        },
      });

      this.logger.log(`Fingerprint stored for song ${songId}`);
    } catch (error) {
      this.logger.error('Failed to store fingerprint:', error.message);
      throw new Error(`Failed to store fingerprint: ${error.message}`);
    }
  }

  /**
   * Check for duplicate songs based on fingerprint
   * @param fingerprintData - New song's fingerprint
   * @param threshold - Similarity threshold (0-100%)
   * @returns List of matching songs
   */
  async checkForDuplicates(
    fingerprintData: FingerprintResultDto,
    threshold: number = this.DEFAULT_THRESHOLD,
  ): Promise<CheckDuplicatesResultDto> {
    try {
      this.logger.log('Checking for duplicates...');

      // Get all existing fingerprints
      const existingFingerprints = await this.prisma.audioFingerprint.findMany({
        include: {
          song: {
            include: {
              artist: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const matches: DuplicateMatchDto[] = [];

      // Compare with each existing fingerprint
      for (const existing of existingFingerprints) {
        const existingLandmarks = JSON.parse(existing.fingerprint);
        const similarity = this.calculateSimilarity(
          fingerprintData.fingerprint,
          existingLandmarks,
        );

        if (similarity >= threshold) {
          matches.push({
            songId: existing.songId,
            title: existing.song.title,
            artistName: existing.song.artist.name,
            similarity,
            matchingLandmarks: this.countMatchingLandmarks(
              fingerprintData.fingerprint,
              existingLandmarks,
            ),
          });
        }
      }

      this.logger.log(`Found ${matches.length} potential duplicates`);

      return {
        matches,
        threshold,
      };
    } catch (error) {
      this.logger.error('Duplicate check failed:', error.message);
      // Don't throw - allow upload to continue even if duplicate check fails
      return {
        matches: [],
        threshold,
      };
    }
  }

  /**
   * Calculate similarity between two fingerprints
   * @param fp1 - First fingerprint (landmarks array)
   * @param fp2 - Second fingerprint (landmarks array)
   * @returns Similarity score (0-100%)
   */
  private calculateSimilarity(fp1: any[], fp2: any[]): number {
    try {
      if (!fp1 || !fp2 || fp1.length === 0 || fp2.length === 0) {
        return 0;
      }

      // Convert landmarks to comparable format
      const set1 = new Set(fp1.map((l) => this.landmarkToString(l)));
      const set2 = new Set(fp2.map((l) => this.landmarkToString(l)));

      // Calculate Jaccard similarity
      const intersection = new Set([...set1].filter((x) => set2.has(x)));
      const union = new Set([...set1, ...set2]);

      const similarity = (intersection.size / union.size) * 100;

      return Math.round(similarity * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      this.logger.warn('Similarity calculation error:', error.message);
      return 0;
    }
  }

  /**
   * Count matching landmarks between two fingerprints
   */
  private countMatchingLandmarks(fp1: any[], fp2: any[]): number {
    try {
      const set1 = new Set(fp1.map((l) => this.landmarkToString(l)));
      const set2 = new Set(fp2.map((l) => this.landmarkToString(l)));
      const intersection = new Set([...set1].filter((x) => set2.has(x)));
      return intersection.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Convert landmark object to string for comparison
   */
  private landmarkToString(landmark: any): string {
    try {
      // Create a consistent string representation
      return `${landmark.time || 0}_${landmark.frequency_zone || 0}_${
        landmark.spectral_peak || 0
      }`;
    } catch (error) {
      return JSON.stringify(landmark);
    }
  }

  /**
   * Create duplicate match records in database
   */
  async createDuplicateMatches(
    newSongId: string,
    matches: DuplicateMatchDto[],
  ): Promise<void> {
    try {
      for (const match of matches) {
        await this.prisma.duplicateMatch.create({
          data: {
            originalSongId: match.songId,
            duplicateSongId: newSongId,
            similarity: match.similarity,
            matchingLandmarks: match.matchingLandmarks,
            status: 'PENDING',
          },
        });
      }

      this.logger.log(
        `Created ${matches.length} duplicate match records for song ${newSongId}`,
      );
    } catch (error) {
      this.logger.error('Failed to create duplicate matches:', error.message);
      // Don't throw - allow upload to continue
    }
  }

  /**
   * Get all duplicate matches for a song
   */
  async getMatchesForSong(songId: string) {
    return this.prisma.duplicateMatch.findMany({
      where: {
        OR: [{ originalSongId: songId }, { duplicateSongId: songId }],
      },
      include: {
        originalSong: {
          include: {
            artist: {
              select: {
                name: true,
              },
            },
          },
        },
        duplicateSong: {
          include: {
            artist: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get all pending duplicate matches (for admin review)
   */
  async getPendingMatches() {
    return this.prisma.duplicateMatch.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        originalSong: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        duplicateSong: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Update duplicate match status (admin action)
   */
  async updateMatchStatus(
    matchId: string,
    status: string,
    reviewedBy: string,
    resolution?: string,
    notes?: string,
  ) {
    return this.prisma.duplicateMatch.update({
      where: { id: matchId },
      data: {
        status: status as any,
        reviewedBy,
        reviewedAt: new Date(),
        resolution,
        notes,
      },
    });
  }
}
