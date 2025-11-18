import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SongsService } from './songs.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerifiedArtistGuard } from '../../common/guards/verified-artist.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UploadSongSchema, UploadSongDto } from './dto/upload-song.dto';
import { SongResponseDto, UploadSongResponseDto } from './dto/song-response.dto';
import { memoryStorage } from 'multer';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  /**
   * POST /api/songs/upload
   * Upload a song (Verified Artists only)
   */
  @Post('upload')
  @UseGuards(JwtAuthGuard, VerifiedArtistGuard)
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15MB
      },
      fileFilter: (req, file, callback) => {
        // Accept only audio files
        const allowedMimeTypes = [
          'audio/mpeg',
          'audio/mp3',
          'audio/wav',
          'audio/x-wav',
          'audio/flac',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `Invalid file type. Only audio files (MP3, WAV, FLAC) are allowed. Received: ${file.mimetype}`,
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadSong(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body(new ZodValidationPipe(UploadSongSchema)) dto: UploadSongDto,
  ): Promise<UploadSongResponseDto> {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    console.log('Uploading song:', {
      userId,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      title: dto.title,
      genre: dto.genre,
    });

    return this.songsService.uploadSong(userId, file, dto);
  }

  /**
   * GET /api/songs/me
   * Get all songs for the logged-in artist
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMySongs(
    @GetUser('id') userId: string,
  ): Promise<SongResponseDto[]> {
    return this.songsService.getMySongs(userId);
  }

  /**
   * GET /api/songs/:id
   * Get song by ID (public)
   */
  @Get(':id')
  async getSongById(@Param('id') songId: string): Promise<SongResponseDto> {
    return this.songsService.getSongById(songId);
  }
}
