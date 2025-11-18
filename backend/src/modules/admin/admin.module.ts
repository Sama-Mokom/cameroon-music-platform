import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { VerificationService } from './verification.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class AdminModule {}
