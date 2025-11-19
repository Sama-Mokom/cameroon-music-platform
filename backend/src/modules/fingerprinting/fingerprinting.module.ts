import { Module } from '@nestjs/common';
import { FingerprintingService } from './fingerprinting.service';
import { FingerprintingController } from './fingerprinting.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FingerprintingController],
  providers: [FingerprintingService],
  exports: [FingerprintingService],
})
export class FingerprintingModule {}
