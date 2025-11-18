import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateArtistProfileDto } from './dto/create-artist-profile.dto';
import { UpdateArtistProfileDto } from './dto/update-artist-profile.dto';
import { ArtistProfileResponse } from './dto/artist-response.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ArtistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create or update artist profile for the authenticated user
   */
  async createOrUpdateProfile(
    userId: string,
    dto: CreateArtistProfileDto,
  ): Promise<ArtistProfileResponse> {
    // Verify user exists and is an artist
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.ARTIST) {
      throw new ForbiddenException('Only artists can create artist profiles');
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.artistProfile.findUnique({
      where: { userId },
    });

    // Prepare data (convert arrays to JSON strings)
    const data = {
      stageName: dto.stageName,
      bio: dto.bio,
      genres: dto.genres ? JSON.stringify(dto.genres) : null,
      tags: dto.tags ? JSON.stringify(dto.tags) : null,
      phoneNumber: dto.phoneNumber,
    };

    let profile;

    if (existingProfile) {
      // Update existing profile
      profile = await this.prisma.artistProfile.update({
        where: { userId },
        data,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          verification: {
            select: {
              status: true,
              rejectionReason: true,
            },
          },
        },
      });
    } else {
      // Create new profile
      profile = await this.prisma.artistProfile.create({
        data: {
          userId,
          ...data,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          verification: {
            select: {
              status: true,
              rejectionReason: true,
            },
          },
        },
      });
    }

    return this.formatArtistProfile(profile);
  }

  /**
   * Update artist profile
   */
  async updateProfile(
    userId: string,
    dto: UpdateArtistProfileDto,
  ): Promise<ArtistProfileResponse> {
    // Check if profile exists
    const existingProfile = await this.prisma.artistProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new NotFoundException('Artist profile not found');
    }

    // Prepare data
    const data = {
      ...(dto.stageName !== undefined && { stageName: dto.stageName }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.genres !== undefined && {
        genres: JSON.stringify(dto.genres),
      }),
      ...(dto.tags !== undefined && { tags: JSON.stringify(dto.tags) }),
      ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
    };

    const profile = await this.prisma.artistProfile.update({
      where: { userId },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        verification: {
          select: {
            status: true,
            rejectionReason: true,
          },
        },
      },
    });

    return this.formatArtistProfile(profile);
  }

  /**
   * Get artist profile by user ID (for authenticated user - own profile)
   */
  async getMyProfile(userId: string): Promise<ArtistProfileResponse> {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        verification: {
          select: {
            status: true,
            rejectionReason: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    return this.formatArtistProfile(profile);
  }

  /**
   * Get artist profile by artist ID (public view)
   */
  async getProfileById(artistId: string): Promise<ArtistProfileResponse> {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { id: artistId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        verification: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Artist profile not found');
    }

    // For public view, don't return rejection reason
    return this.formatArtistProfile(profile, true);
  }

  /**
   * Get all artist profiles (public list)
   */
  async getAllProfiles(): Promise<ArtistProfileResponse[]> {
    const profiles = await this.prisma.artistProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        verification: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return profiles.map((profile) => this.formatArtistProfile(profile, true));
  }

  /**
   * Update avatar URL (called after upload)
   */
  async updateAvatarUrl(
    userId: string,
    avatarUrl: string,
  ): Promise<ArtistProfileResponse> {
    const profile = await this.prisma.artistProfile.update({
      where: { userId },
      data: { avatarUrl },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        verification: {
          select: {
            status: true,
            rejectionReason: true,
          },
        },
      },
    });

    return this.formatArtistProfile(profile);
  }

  /**
   * Update cover URL (called after upload)
   */
  async updateCoverUrl(
    userId: string,
    coverUrl: string,
  ): Promise<ArtistProfileResponse> {
    const profile = await this.prisma.artistProfile.update({
      where: { userId },
      data: { coverUrl },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        verification: {
          select: {
            status: true,
            rejectionReason: true,
          },
        },
      },
    });

    return this.formatArtistProfile(profile);
  }

  /**
   * Format artist profile for response
   */
  private formatArtistProfile(
    profile: any,
    isPublic = false,
  ): ArtistProfileResponse {
    return {
      id: profile.id,
      userId: profile.userId,
      stageName: profile.stageName,
      bio: profile.bio,
      genres: profile.genres ? JSON.parse(profile.genres) : [],
      tags: profile.tags ? JSON.parse(profile.tags) : [],
      phoneNumber: profile.phoneNumber,
      avatarUrl: profile.avatarUrl,
      coverUrl: profile.coverUrl,
      verified: profile.verified,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      user: profile.user,
      verification: profile.verification
        ? {
            status: profile.verification.status,
            // Only include rejection reason if not public view
            ...((!isPublic && profile.verification.rejectionReason) && {
              rejectionReason: profile.verification.rejectionReason,
            }),
          }
        : undefined,
    };
  }
}
