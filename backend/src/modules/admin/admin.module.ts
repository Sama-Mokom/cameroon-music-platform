import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { VerificationService } from './verification.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { FingerprintingModule } from '../fingerprinting/fingerprinting.module';

@Module({
  imports: [PrismaModule, FingerprintingModule],
  controllers: [AdminController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class AdminModule {}
