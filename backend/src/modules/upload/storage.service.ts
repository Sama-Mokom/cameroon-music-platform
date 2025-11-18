import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly useCloudinary: boolean;
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    // Check if Cloudinary is configured
    const cloudinaryUrl = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    this.useCloudinary = !!cloudinaryUrl;

    if (!this.useCloudinary) {
      this.logger.warn('Cloudinary not configured. Using local file storage.');
    }

    // Set up local upload directory
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDirectoryExists();
  }

  /**
   * Ensure the upload directory exists
   */
  private async ensureUploadDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'avatars'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'covers'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'verifications'), { recursive: true });
      this.logger.log(`Upload directories created at: ${this.uploadDir}`);
    } catch (error) {
      this.logger.error('Failed to create upload directories', error);
    }
  }

  /**
   * Save file to storage (Cloudinary or local)
   */
  async saveFile(
    buffer: Buffer,
    filename: string,
    folder: 'avatars' | 'covers' | 'verifications',
  ): Promise<string> {
    if (this.useCloudinary) {
      return this.saveToCloudinary(buffer, filename, folder);
    } else {
      return this.saveToLocal(buffer, filename, folder);
    }
  }

  /**
   * Save file to Cloudinary
   */
  private async saveToCloudinary(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): Promise<string> {
    // TODO: Implement Cloudinary upload when credentials are available
    // For now, fallback to local storage
    this.logger.warn('Cloudinary upload not yet implemented. Falling back to local storage.');
    return this.saveToLocal(buffer, filename, folder);
  }

  /**
   * Save file to local filesystem
   */
  private async saveToLocal(
    buffer: Buffer,
    filename: string,
    folder: string,
  ): Promise<string> {
    try {
      const filePath = path.join(this.uploadDir, folder, filename);
      await fs.writeFile(filePath, buffer);

      // Return relative URL for accessing the file
      const baseUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
      return `${baseUrl}/uploads/${folder}/${filename}`;
    } catch (error) {
      this.logger.error('Failed to save file to local storage', error);
      throw new InternalServerErrorException('Failed to save file');
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (this.useCloudinary && fileUrl.includes('cloudinary')) {
      await this.deleteFromCloudinary(fileUrl);
    } else {
      await this.deleteFromLocal(fileUrl);
    }
  }

  /**
   * Delete file from Cloudinary
   */
  private async deleteFromCloudinary(fileUrl: string): Promise<void> {
    // TODO: Implement Cloudinary delete when credentials are available
    this.logger.warn('Cloudinary delete not yet implemented.');
  }

  /**
   * Delete file from local filesystem
   */
  private async deleteFromLocal(fileUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const urlParts = fileUrl.split('/uploads/');
      if (urlParts.length < 2) return;

      const relativePath = urlParts[1];
      const filePath = path.join(this.uploadDir, relativePath);

      await fs.unlink(filePath);
      this.logger.log(`Deleted file: ${filePath}`);
    } catch (error) {
      this.logger.error('Failed to delete file from local storage', error);
      // Don't throw error - file might already be deleted
    }
  }

  /**
   * Check if using Cloudinary
   */
  isUsingCloudinary(): boolean {
    return this.useCloudinary;
  }
}
