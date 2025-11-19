import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * Get current user's statistics
   * For artists: songs uploaded, total plays, followers
   * For users: songs played, favorites, playlists
   */
  @Get('me')
  async getMyStatistics(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
  ) {

    if (userRole === 'ARTIST') {
      return this.statisticsService.getArtistStatistics(userId);
    } else {
      return this.statisticsService.getUserStatistics(userId);
    }
  }

  /**
   * Get artist statistics by ID (public)
   */
  @Get('artist/:artistId')
  async getArtistStatistics(@Param('artistId') artistId: string) {
    return this.statisticsService.getArtistStatistics(artistId);
  }

  /**
   * Track a song play
   */
  @Post('play/:songId')
  async trackPlay(
    @GetUser('id') userId: string,
    @Param('songId') songId: string,
  ) {
    await this.statisticsService.trackPlay(userId, songId);
    return { success: true };
  }

  /**
   * Add song to favorites
   */
  @Post('favorites/:songId')
  async addFavorite(
    @GetUser('id') userId: string,
    @Param('songId') songId: string,
  ) {
    await this.statisticsService.addFavorite(userId, songId);
    return { success: true };
  }

  /**
   * Remove song from favorites
   */
  @Delete('favorites/:songId')
  async removeFavorite(
    @GetUser('id') userId: string,
    @Param('songId') songId: string,
  ) {
    await this.statisticsService.removeFavorite(userId, songId);
    return { success: true };
  }

  /**
   * Check if song is favorited
   */
  @Get('favorites/:songId/check')
  async checkFavorite(
    @GetUser('id') userId: string,
    @Param('songId') songId: string,
  ) {
    const isFavorite = await this.statisticsService.isFavorite(userId, songId);
    return { isFavorite };
  }

  /**
   * Get user's favorites
   */
  @Get('favorites')
  async getFavorites(@GetUser('id') userId: string) {
    return this.statisticsService.getUserFavorites(userId);
  }

  /**
   * Get user's playlists
   */
  @Get('playlists')
  async getPlaylists(@GetUser('id') userId: string) {
    return this.statisticsService.getUserPlaylists(userId);
  }

  /**
   * Create a new playlist
   */
  @Post('playlists')
  async createPlaylist(
    @GetUser('id') userId: string,
    @Body() createPlaylistDto: { name: string; description?: string },
  ) {
    return this.statisticsService.createPlaylist(
      userId,
      createPlaylistDto.name,
      createPlaylistDto.description,
    );
  }

  /**
   * Add song to playlist
   */
  @Post('playlists/:playlistId/songs/:songId')
  async addSongToPlaylist(
    @GetUser('id') userId: string,
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string,
  ) {
    await this.statisticsService.addSongToPlaylist(playlistId, songId, userId);
    return { success: true };
  }

  /**
   * Remove song from playlist
   */
  @Delete('playlists/:playlistId/songs/:songId')
  async removeSongFromPlaylist(
    @GetUser('id') userId: string,
    @Param('playlistId') playlistId: string,
    @Param('songId') songId: string,
  ) {
    await this.statisticsService.removeSongFromPlaylist(playlistId, songId, userId);
    return { success: true };
  }

  /**
   * Follow an artist
   */
  @Post('follow/:artistId')
  async followArtist(
    @GetUser('id') userId: string,
    @Param('artistId') artistId: string,
  ) {
    await this.statisticsService.followArtist(userId, artistId);
    return { success: true };
  }

  /**
   * Unfollow an artist
   */
  @Delete('follow/:artistId')
  async unfollowArtist(
    @GetUser('id') userId: string,
    @Param('artistId') artistId: string,
  ) {
    await this.statisticsService.unfollowArtist(userId, artistId);
    return { success: true };
  }

  /**
   * Check if following an artist
   */
  @Get('follow/:artistId/check')
  async checkFollowing(
    @GetUser('id') userId: string,
    @Param('artistId') artistId: string,
  ) {
    const isFollowing = await this.statisticsService.isFollowing(userId, artistId);
    return { isFollowing };
  }
}
