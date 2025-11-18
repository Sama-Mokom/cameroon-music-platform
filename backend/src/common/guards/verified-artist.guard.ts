import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class VerifiedArtistGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Must be an artist
    if (user.role !== UserRole.ARTIST) {
      throw new ForbiddenException('Only artists can upload songs');
    }

    // Check if artist is verified
    const artistProfile = await this.prisma.artistProfile.findUnique({
      where: { userId: user.id },
      include: {
        verification: true,
      },
    });

    if (!artistProfile) {
      throw new ForbiddenException('Artist profile not found. Please create your profile first.');
    }

    if (!artistProfile.verified) {
      throw new ForbiddenException(
        'Your artist account must be verified before you can upload songs. Please complete Level 1 verification.',
      );
    }

    if (artistProfile.verification?.status !== 'VERIFIED') {
      throw new ForbiddenException(
        'Your verification is pending or was rejected. Please wait for approval or resubmit your verification documents.',
      );
    }

    return true;
  }
}
