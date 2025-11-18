import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import { parseBuffer } from 'music-metadata';
import { UploadSongDto } from './dto/upload-song.dto';
import { SongResponseDto, UploadSongResponseDto } from './dto/song-response.dto';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Upload song to Cloudinary and save to database
   */
  async uploadSong(
    userId: string,
    file: Express.Multer.File,
    dto: UploadSongDto,
  ): Promise<UploadSongResponseDto> {
    try {
      // Extract audio metadata
      const metadata = await this.extractMetadata(file.buffer);

      // Upload to Cloudinary
      const uploadResult = await this.uploadToCloudinary(
        file.buffer,
        userId,
        file.originalname,
      );

      // Use the secure URL directly from Cloudinary
      const audioUrl = uploadResult.secure_url;

      console.log('Cloudinary upload result:', {
        url: audioUrl,
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        resourceType: uploadResult.resource_type,
      });

      // Create song record in database
      const song = await this.prisma.song.create({
        data: {
          title: dto.title,
          genre: dto.genre || null,
          artistId: userId,
          audioUrl: audioUrl,
          publicId: uploadResult.public_id,
          duration: metadata.duration || null,
          size: file.size,
          format: metadata.format || file.mimetype.split('/')[1] || null,
        },
        include: {
          artist: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        message: 'Song uploaded successfully',
        song: this.formatSongResponse(song),
      };
    } catch (error) {
      console.error('Error uploading song:', error);
      throw new BadRequestException(
        error.message || 'Failed to upload song',
      );
    }
  }

  /**
   * Get all songs from verified artists (public endpoint with pagination)
   */
  async getAllSongs(
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ songs: SongResponseDto[]; total: number }> {
    // Get total count
    const total = await this.prisma.song.count({
      where: {
        artist: {
          role: 'ARTIST',
          artistProfile: {
            verified: true,
          },
        },
      },
    });

    // Get paginated songs
    const songs = await this.prisma.song.findMany({
      where: {
        artist: {
          role: 'ARTIST',
          artistProfile: {
            verified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      songs: songs.map((song) => this.formatSongResponse(song)),
      total,
    };
  }

  /**
   * Get all songs for the logged-in artist
   */
  async getMySongs(userId: string): Promise<SongResponseDto[]> {
    const songs = await this.prisma.song.findMany({
      where: { artistId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return songs.map((song) => this.formatSongResponse(song));
  }

  /**
   * Get song by ID
   */
  async getSongById(songId: string): Promise<SongResponseDto> {
    const song = await this.prisma.song.findUnique({
      where: { id: songId },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!song) {
      throw new NotFoundException('Song not found');
    }

    return this.formatSongResponse(song);
  }

  /**
   * Extract metadata from audio file
   */
  private async extractMetadata(
    buffer: Buffer,
  ): Promise<{ duration: number | null; format: string | null }> {
    try {
      const metadata = await parseBuffer(buffer);

      return {
        duration: metadata.format.duration
          ? Math.round(metadata.format.duration)
          : null,
        format: metadata.format.container || null,
      };
    } catch (error) {
      console.warn('Failed to extract metadata:', error.message);
      return {
        duration: null,
        format: null,
      };
    }
  }

  /**
   * Upload audio file to Cloudinary
   */
  private uploadToCloudinary(
    buffer: Buffer,
    artistId: string,
    filename: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Cloudinary uses 'video' for audio files
          folder: `cimfest/songs/${artistId}`,
          public_id: `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}`,
          type: 'upload', // Standard upload type
          access_mode: 'public', // Make files publicly accessible
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Format song response
   */
  private formatSongResponse(song: any): SongResponseDto {
    return {
      id: song.id,
      title: song.title,
      genre: song.genre,
      artistId: song.artistId,
      audioUrl: song.audioUrl,
      publicId: song.publicId,
      duration: song.duration,
      size: song.size,
      format: song.format,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
      artist: song.artist
        ? {
            id: song.artist.id,
            name: song.artist.name,
            email: song.artist.email,
          }
        : undefined,
    };
  }
}
