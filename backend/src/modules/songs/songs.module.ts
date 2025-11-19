import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { FingerprintingModule } from '../fingerprinting/fingerprinting.module';

@Module({
  imports: [PrismaModule, FingerprintingModule],
  controllers: [SongsController],
  providers: [SongsService],
  exports: [SongsService],
})
export class SongsModule {}
