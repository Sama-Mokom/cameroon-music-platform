import * as sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';

export interface ImageProcessingOptions {
  width: number;
  height: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export const IMAGE_PROCESSING_PRESETS = {
  avatar: {
    width: 200,
    height: 200,
    quality: 90,
    format: 'jpeg' as const,
  },
  cover: {
    width: 1600,
    height: 400,
    quality: 85,
    format: 'jpeg' as const,
  },
  verification: {
    width: 1200,
    height: 1600,
    quality: 90,
    format: 'jpeg' as const,
  },
};

export async function processImage(
  buffer: Buffer,
  options: ImageProcessingOptions,
): Promise<Buffer> {
  try {
    let pipeline = sharp(buffer);

    // Resize with cover strategy (crops to fit)
    pipeline = pipeline.resize(options.width, options.height, {
      fit: 'cover',
      position: 'center',
    });

    // Convert to specified format
    switch (options.format || 'jpeg') {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality: options.quality || 85 });
        break;
      case 'png':
        pipeline = pipeline.png({ quality: options.quality || 85 });
        break;
      case 'webp':
        pipeline = pipeline.webp({ quality: options.quality || 85 });
        break;
    }

    return await pipeline.toBuffer();
  } catch (error) {
    throw new BadRequestException(
      `Image processing failed: ${error.message}`,
    );
  }
}

export async function processAvatar(buffer: Buffer): Promise<Buffer> {
  return processImage(buffer, IMAGE_PROCESSING_PRESETS.avatar);
}

export async function processCover(buffer: Buffer): Promise<Buffer> {
  return processImage(buffer, IMAGE_PROCESSING_PRESETS.cover);
}

export async function processVerificationImage(
  buffer: Buffer,
): Promise<Buffer> {
  return processImage(buffer, IMAGE_PROCESSING_PRESETS.verification);
}
