import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import {
  AvatarUploadResponse,
  CoverUploadResponse,
  VerificationUploadResponse,
} from './dto/upload-response.dto';
import { UserRole } from '@prisma/client';
import { memoryStorage } from 'multer';

@Controller('artists/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ARTIST)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * POST /api/artists/uploads/avatar
   * Upload artist avatar (ARTIST only)
   */
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AvatarUploadResponse> {
    console.log('Upload avatar endpoint hit. UserId:', userId);
    console.log('File received:', file ? 'Yes' : 'No');

    if (!file) {
      console.error('No avatar file uploaded');
      throw new BadRequestException('No avatar file uploaded');
    }

    console.log('Avatar file details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.uploadService.uploadAvatar(userId, file);
  }

  /**
   * POST /api/artists/uploads/cover
   * Upload artist cover image (ARTIST only)
   */
  @Post('cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadCover(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CoverUploadResponse> {
    console.log('Upload cover endpoint hit. UserId:', userId);
    console.log('File received:', file ? 'Yes' : 'No');

    if (!file) {
      console.error('No cover file uploaded');
      throw new BadRequestException('No cover file uploaded');
    }

    console.log('Cover file details:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    return this.uploadService.uploadCover(userId, file);
  }

  /**
   * POST /api/artists/uploads/verification
   * Upload verification documents (ID + Selfie) (ARTIST only)
   */
  @Post('verification')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
      },
    }),
  )
  async uploadVerification(
    @GetUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('idType') idType: string,
    @Body('idFileIndex') idFileIndex?: string,
    @Body('selfieFileIndex') selfieFileIndex?: string,
  ): Promise<VerificationUploadResponse> {
    if (!files || files.length !== 2) {
      throw new BadRequestException(
        'Exactly 2 files required: ID document and selfie',
      );
    }

    if (!idType) {
      throw new BadRequestException('idType is required');
    }

    // Determine which file is which based on provided indices or field names
    let idFile: Express.Multer.File;
    let selfieFile: Express.Multer.File;

    // If indices provided, use them
    if (idFileIndex !== undefined && selfieFileIndex !== undefined) {
      const idIdx = parseInt(idFileIndex, 10);
      const selfieIdx = parseInt(selfieFileIndex, 10);

      if (isNaN(idIdx) || isNaN(selfieIdx) || idIdx === selfieIdx) {
        throw new BadRequestException('Invalid file indices');
      }

      idFile = files[idIdx];
      selfieFile = files[selfieIdx];
    } else {
      // Default: first file is ID, second is selfie
      [idFile, selfieFile] = files;
    }

    if (!idFile || !selfieFile) {
      throw new BadRequestException('Both ID and selfie files are required');
    }

    return this.uploadService.uploadVerificationDocuments(
      userId,
      idFile,
      selfieFile,
      idType,
    );
  }
}
