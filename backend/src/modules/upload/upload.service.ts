import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { ArtistService } from '../artist/artist.service';
import {
  validateFile,
  generateFileName,
  getFileExtension,
  FileType,
} from './utils/file-validation';
import {
  processAvatar,
  processCover,
  processVerificationImage,
} from './utils/image-processor';
import {
  AvatarUploadResponse,
  CoverUploadResponse,
  VerificationUploadResponse,
} from './dto/upload-response.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly storageService: StorageService,
    private readonly artistService: ArtistService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Upload and set artist avatar
   */
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<AvatarUploadResponse> {
    // Validate file
    validateFile(file, FileType.AVATAR);

    // Verify artist profile exists
    await this.getArtistProfile(userId);

    // Process image (resize to 200x200)
    const processedBuffer = await processAvatar(file.buffer);

    // Generate unique filename
    const extension = getFileExtension(file.originalname);
    const filename = generateFileName(userId, FileType.AVATAR, extension);

    // Save to storage
    const url = await this.storageService.saveFile(
      processedBuffer,
      filename,
      'avatars',
    );

    // Update artist profile with new avatar URL
    await this.artistService.updateAvatarUrl(userId, url);

    // TODO: Delete old avatar if exists (cleanup)

    return {
      url,
      filename,
      size: processedBuffer.length,
      mimetype: file.mimetype,
      message: 'Avatar uploaded successfully',
    };
  }

  /**
   * Upload and set artist cover image
   */
  async uploadCover(
    userId: string,
    file: Express.Multer.File,
  ): Promise<CoverUploadResponse> {
    // Validate file
    validateFile(file, FileType.COVER);

    // Verify artist profile exists
    await this.getArtistProfile(userId);

    // Process image (resize to 1600x400)
    const processedBuffer = await processCover(file.buffer);

    // Generate unique filename
    const extension = getFileExtension(file.originalname);
    const filename = generateFileName(userId, FileType.COVER, extension);

    // Save to storage
    const url = await this.storageService.saveFile(
      processedBuffer,
      filename,
      'covers',
    );

    // Update artist profile with new cover URL
    await this.artistService.updateCoverUrl(userId, url);

    // TODO: Delete old cover if exists (cleanup)

    return {
      url,
      filename,
      size: processedBuffer.length,
      mimetype: file.mimetype,
      message: 'Cover image uploaded successfully',
    };
  }

  /**
   * Upload verification documents (ID + Selfie)
   */
  async uploadVerificationDocuments(
    userId: string,
    idFile: Express.Multer.File,
    selfieFile: Express.Multer.File,
    idType: string,
  ): Promise<VerificationUploadResponse> {
    // Validate files
    validateFile(idFile, FileType.ID_DOCUMENT);
    validateFile(selfieFile, FileType.SELFIE);

    // Validate ID type
    const validIdTypes = ['national_id', 'passport', 'driver_license'];
    if (!validIdTypes.includes(idType)) {
      throw new BadRequestException(
        `Invalid ID type. Allowed: ${validIdTypes.join(', ')}`,
      );
    }

    // Verify artist profile exists
    const artistProfile = await this.getArtistProfile(userId);

    // Check if verification already exists
    const existingVerification = await this.prisma.verification.findUnique({
      where: { artistProfileId: artistProfile.id },
    });

    if (existingVerification && existingVerification.status === 'PENDING') {
      throw new BadRequestException(
        'Verification already pending. Please wait for admin review.',
      );
    }

    if (existingVerification && existingVerification.status === 'VERIFIED') {
      throw new BadRequestException('Artist is already verified.');
    }

    // Process images
    const processedIdBuffer = await processVerificationImage(idFile.buffer);
    const processedSelfieBuffer = await processVerificationImage(
      selfieFile.buffer,
    );

    // Generate unique filenames
    const idExtension = getFileExtension(idFile.originalname);
    const selfieExtension = getFileExtension(selfieFile.originalname);
    const idFilename = generateFileName(userId, FileType.ID_DOCUMENT, idExtension);
    const selfieFilename = generateFileName(userId, FileType.SELFIE, selfieExtension);

    // Save to storage
    const idFileUrl = await this.storageService.saveFile(
      processedIdBuffer,
      idFilename,
      'verifications',
    );

    const selfieFileUrl = await this.storageService.saveFile(
      processedSelfieBuffer,
      selfieFilename,
      'verifications',
    );

    // Create or update verification record
    if (existingVerification) {
      // Update existing (if rejected, allow re-submission)
      await this.prisma.verification.update({
        where: { id: existingVerification.id },
        data: {
          idType,
          idFileUrl,
          selfieFileUrl,
          status: 'PENDING',
          rejectionReason: null,
          reviewedBy: null,
          reviewedAt: null,
        },
      });
    } else {
      // Create new verification
      await this.prisma.verification.create({
        data: {
          artistProfileId: artistProfile.id,
          idType,
          idFileUrl,
          selfieFileUrl,
          status: 'PENDING',
        },
      });
    }

    return {
      idFileUrl,
      selfieFileUrl,
      message: 'Verification documents uploaded successfully. Awaiting admin review.',
    };
  }

  /**
   * Helper: Get artist profile or throw error
   */
  private async getArtistProfile(userId: string) {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(
        'Artist profile not found. Please create your profile first.',
      );
    }

    return profile;
  }
}
