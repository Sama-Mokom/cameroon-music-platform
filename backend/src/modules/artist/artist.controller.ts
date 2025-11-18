import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ArtistService } from './artist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreateArtistProfileSchema,
  CreateArtistProfileDto,
} from './dto/create-artist-profile.dto';
import {
  UpdateArtistProfileSchema,
  UpdateArtistProfileDto,
} from './dto/update-artist-profile.dto';
import { ArtistProfileResponse } from './dto/artist-response.dto';
import { UserRole } from '@prisma/client';

@Controller('artists')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  /**
   * POST /api/artists
   * Create or update artist profile (authenticated artist only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST)
  async createProfile(
    @GetUser('id') userId: string,
    @Body(new ZodValidationPipe(CreateArtistProfileSchema)) dto: CreateArtistProfileDto,
  ): Promise<ArtistProfileResponse> {
    return this.artistService.createOrUpdateProfile(userId, dto);
  }

  /**
   * PUT /api/artists/me
   * Update own artist profile (authenticated artist only)
   */
  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST)
  async updateMyProfile(
    @GetUser('id') userId: string,
    @Body(new ZodValidationPipe(UpdateArtistProfileSchema)) dto: UpdateArtistProfileDto,
  ): Promise<ArtistProfileResponse> {
    return this.artistService.updateProfile(userId, dto);
  }

  /**
   * GET /api/artists/me
   * Get own artist profile (authenticated artist only)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ARTIST)
  async getMyProfile(
    @GetUser('id') userId: string,
  ): Promise<ArtistProfileResponse> {
    return this.artistService.getMyProfile(userId);
  }

  /**
   * GET /api/artists
   * Get all artist profiles (public)
   */
  @Get()
  async getAllProfiles(): Promise<ArtistProfileResponse[]> {
    return this.artistService.getAllProfiles();
  }

  /**
   * GET /api/artists/:id
   * Get artist profile by ID (public)
   */
  @Get(':id')
  async getProfileById(
    @Param('id') artistId: string,
  ): Promise<ArtistProfileResponse> {
    return this.artistService.getProfileById(artistId);
  }
}
