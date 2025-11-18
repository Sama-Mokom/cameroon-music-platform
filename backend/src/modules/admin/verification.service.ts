import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  VerificationDetailResponse,
  VerificationActionResponse,
} from './dto/verification-response.dto';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all pending verifications
   */
  async getPendingVerifications(): Promise<VerificationDetailResponse[]> {
    const verifications = await this.prisma.verification.findMany({
      where: {
        status: VerificationStatus.PENDING,
      },
      include: {
        artistProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Oldest first (FIFO)
      },
    });

    return verifications.map((v) => this.formatVerificationResponse(v));
  }

  /**
   * Get all verifications (with optional status filter)
   */
  async getAllVerifications(
    status?: VerificationStatus,
  ): Promise<VerificationDetailResponse[]> {
    const verifications = await this.prisma.verification.findMany({
      where: status ? { status } : undefined,
      include: {
        artistProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return verifications.map((v) => this.formatVerificationResponse(v));
  }

  /**
   * Get verification by ID
   */
  async getVerificationById(
    verificationId: string,
  ): Promise<VerificationDetailResponse> {
    const verification = await this.prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        artistProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    return this.formatVerificationResponse(verification);
  }

  /**
   * Approve verification
   */
  async approveVerification(
    verificationId: string,
    adminId: string,
  ): Promise<VerificationActionResponse> {
    // Get verification
    const verification = await this.prisma.verification.findUnique({
      where: { id: verificationId },
      include: {
        artistProfile: true,
      },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    if (verification.status === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Verification already approved');
    }

    // Update verification status
    const updated = await this.prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: VerificationStatus.VERIFIED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: null, // Clear any previous rejection reason
      },
    });

    // Update artist profile verified flag
    await this.prisma.artistProfile.update({
      where: { id: verification.artistProfileId },
      data: {
        verified: true,
      },
    });

    return {
      message: 'Verification approved successfully',
      verification: {
        id: updated.id,
        status: updated.status,
        artistProfileId: updated.artistProfileId,
        reviewedBy: updated.reviewedBy!,
        reviewedAt: updated.reviewedAt!,
        rejectionReason: updated.rejectionReason,
      },
    };
  }

  /**
   * Reject verification
   */
  async rejectVerification(
    verificationId: string,
    adminId: string,
    rejectionReason: string,
  ): Promise<VerificationActionResponse> {
    // Get verification
    const verification = await this.prisma.verification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    if (verification.status === VerificationStatus.VERIFIED) {
      throw new BadRequestException(
        'Cannot reject an already verified artist. Please revoke verification first.',
      );
    }

    // Update verification status
    const updated = await this.prisma.verification.update({
      where: { id: verificationId },
      data: {
        status: VerificationStatus.REJECTED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason,
      },
    });

    // Ensure artist profile verified flag is false
    await this.prisma.artistProfile.update({
      where: { id: verification.artistProfileId },
      data: {
        verified: false,
      },
    });

    return {
      message: 'Verification rejected',
      verification: {
        id: updated.id,
        status: updated.status,
        artistProfileId: updated.artistProfileId,
        reviewedBy: updated.reviewedBy!,
        reviewedAt: updated.reviewedAt!,
        rejectionReason: updated.rejectionReason,
      },
    };
  }

  /**
   * Format verification response
   */
  private formatVerificationResponse(verification: any): VerificationDetailResponse {
    return {
      id: verification.id,
      artistProfileId: verification.artistProfileId,
      idType: verification.idType,
      idFileUrl: verification.idFileUrl,
      selfieFileUrl: verification.selfieFileUrl,
      status: verification.status,
      rejectionReason: verification.rejectionReason,
      reviewedBy: verification.reviewedBy,
      reviewedAt: verification.reviewedAt,
      createdAt: verification.createdAt,
      updatedAt: verification.updatedAt,
      artistProfile: {
        id: verification.artistProfile.id,
        stageName: verification.artistProfile.stageName,
        user: {
          id: verification.artistProfile.user.id,
          name: verification.artistProfile.user.name,
          email: verification.artistProfile.user.email,
        },
      },
    };
  }
}
