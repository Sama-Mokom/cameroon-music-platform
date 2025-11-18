import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { StorageService } from './storage.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ArtistModule } from '../artist/artist.module';

@Module({
  imports: [PrismaModule, ArtistModule],
  controllers: [UploadController],
  providers: [UploadService, StorageService],
  exports: [UploadService, StorageService],
})
export class UploadModule {}
