import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  ApproveVerificationSchema,
  ApproveVerificationDto,
} from './dto/approve-verification.dto';
import {
  RejectVerificationSchema,
  RejectVerificationDto,
} from './dto/reject-verification.dto';
import {
  VerificationDetailResponse,
  VerificationActionResponse,
} from './dto/verification-response.dto';
import { UserRole, VerificationStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly verificationService: VerificationService) {}

  /**
   * GET /api/admin/verifications
   * Get all verifications (with optional status filter)
   */
  @Get('verifications')
  async getVerifications(
    @Query('status') status?: VerificationStatus,
  ): Promise<VerificationDetailResponse[]> {
    if (status === 'PENDING' as any || status === VerificationStatus.PENDING) {
      return this.verificationService.getPendingVerifications();
    }
    return this.verificationService.getAllVerifications(status);
  }

  /**
   * GET /api/admin/verifications/:id
   * Get verification by ID
   */
  @Get('verifications/:id')
  async getVerificationById(
    @Param('id') verificationId: string,
  ): Promise<VerificationDetailResponse> {
    return this.verificationService.getVerificationById(verificationId);
  }

  /**
   * POST /api/admin/verifications/:id/approve
   * Approve verification
   */
  @Post('verifications/:id/approve')
  async approveVerification(
    @Param('id') verificationId: string,
    @GetUser('id') adminId: string,
  ): Promise<VerificationActionResponse> {
    return this.verificationService.approveVerification(
      verificationId,
      adminId,
    );
  }

  /**
   * POST /api/admin/verifications/:id/reject
   * Reject verification with reason
   */
  @Post('verifications/:id/reject')
  @UsePipes(new ZodValidationPipe(RejectVerificationSchema))
  async rejectVerification(
    @Param('id') verificationId: string,
    @GetUser('id') adminId: string,
    @Body() dto: RejectVerificationDto,
  ): Promise<VerificationActionResponse> {
    return this.verificationService.rejectVerification(
      verificationId,
      adminId,
      dto.rejectionReason,
    );
  }
}
