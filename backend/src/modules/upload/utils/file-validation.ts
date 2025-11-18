import { BadRequestException } from '@nestjs/common';

export enum FileType {
  AVATAR = 'avatar',
  COVER = 'cover',
  ID_DOCUMENT = 'id_document',
  SELFIE = 'selfie',
}

export interface FileValidationConfig {
  maxSize: number; // in bytes
  allowedMimeTypes: string[];
  fileType: FileType;
}

export const FILE_VALIDATION_CONFIGS: Record<FileType, FileValidationConfig> = {
  [FileType.AVATAR]: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileType: FileType.AVATAR,
  },
  [FileType.COVER]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileType: FileType.COVER,
  },
  [FileType.ID_DOCUMENT]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileType: FileType.ID_DOCUMENT,
  },
  [FileType.SELFIE]: {
    maxSize: 6 * 1024 * 1024, // 6MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileType: FileType.SELFIE,
  },
};

export function validateFile(
  file: Express.Multer.File,
  fileType: FileType,
): void {
  const config = FILE_VALIDATION_CONFIGS[fileType];

  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(2);
    throw new BadRequestException(
      `File size exceeds ${maxSizeMB}MB limit for ${fileType}`,
    );
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
    );
  }

  // Additional check: verify file has proper extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const fileExtension = getFileExtension(file.originalname).toLowerCase();
  const hasValidExtension = allowedExtensions.includes(fileExtension);

  if (!hasValidExtension) {
    throw new BadRequestException(
      'Invalid file extension. Allowed: .jpg, .jpeg, .png, .webp',
    );
  }
}

export function generateFileName(
  userId: string,
  fileType: FileType,
  originalExtension: string,
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${fileType}-${userId}-${timestamp}-${randomString}${originalExtension}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}
