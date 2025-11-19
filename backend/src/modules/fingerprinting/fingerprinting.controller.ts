import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FingerprintingService } from './fingerprinting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/fingerprinting')
export class FingerprintingController {
  constructor(private readonly fingerprintingService: FingerprintingService) {}

  /**
   * Get duplicate matches for a specific song
   */
  @Get('matches/:songId')
  @UseGuards(JwtAuthGuard)
  async getMatches(@Param('songId') songId: string) {
    return this.fingerprintingService.getMatchesForSong(songId);
  }

  /**
   * Get all pending duplicate matches (admin only)
   */
  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async getPendingMatches() {
    return this.fingerprintingService.getPendingMatches();
  }
}
