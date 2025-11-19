import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface UserStatistics {
  songsPlayed: number;
  favorites: number;
  playlists: number;
}

export interface ArtistStatistics {
  songsUploaded: number;
  totalPlays: number;
  followers: number;
}

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get statistics for a regular user (listener)
   */
  async getUserStatistics(userId: string): Promise<UserStatistics> {
    // Count unique songs played by this user
    const uniqueSongs = await this.prisma.playHistory.findMany({
      where: { userId },
      distinct: ['songId'],
      select: { songId: true },
    });
    const songsPlayed = uniqueSongs.length;

    // Count user's favorites
    const favorites = await this.prisma.favorite.count({
      where: { userId },
    });

    // Count user's playlists
    const playlists = await this.prisma.playlist.count({
      where: { userId },
    });

    return {
      songsPlayed,
      favorites,
      playlists,
    };
  }

  /**
   * Get statistics for an artist
   */
  async getArtistStatistics(userId: string): Promise<ArtistStatistics> {
    // Count songs uploaded by this artist
    const songsUploaded = await this.prisma.song.count({
      where: { artistId: userId },
    });

    // Count total plays of all artist's songs
    const totalPlays = await this.prisma.playHistory.count({
      where: {
        song: {
          artistId: userId,
        },
      },
    });

    // Count followers (users following this artist)
    const followers = await this.prisma.follow.count({
      where: { artistId: userId },
    });

    return {
      songsUploaded,
      totalPlays,
      followers,
    };
  }

  /**
   * Track a song play
   */
  async trackPlay(userId: string, songId: string): Promise<void> {
    await this.prisma.playHistory.create({
      data: {
        userId,
        songId,
      },
    });
  }

  /**
   * Add a song to favorites
   */
  async addFavorite(userId: string, songId: string): Promise<void> {
    await this.prisma.favorite.upsert({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
      update: {}, // Do nothing if already exists
      create: {
        userId,
        songId,
      },
    });
  }

  /**
   * Remove a song from favorites
   */
  async removeFavorite(userId: string, songId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        songId,
      },
    });
  }

  /**
   * Check if a song is favorited by a user
   */
  async isFavorite(userId: string, songId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
    });
    return !!favorite;
  }

  /**
   * Get user's favorite songs
   */
  async getUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        song: {
          include: {
            artist: {
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
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      include: {
        songs: {
          include: {
            song: {
              include: {
                artist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(userId: string, name: string, description?: string) {
    return this.prisma.playlist.create({
      data: {
        userId,
        name,
        description,
      },
    });
  }

  /**
   * Add song to playlist
   */
  async addSongToPlaylist(playlistId: string, songId: string, userId: string) {
    // Verify playlist belongs to user
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
      include: {
        songs: true,
      },
    });

    if (!playlist) {
      throw new Error('Playlist not found or unauthorized');
    }

    // Calculate position (add to end)
    const position = playlist.songs.length;

    await this.prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        position,
      },
    });
  }

  /**
   * Remove song from playlist
   */
  async removeSongFromPlaylist(playlistId: string, songId: string, userId: string) {
    // Verify playlist belongs to user
    const playlist = await this.prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
    });

    if (!playlist) {
      throw new Error('Playlist not found or unauthorized');
    }

    await this.prisma.playlistSong.deleteMany({
      where: {
        playlistId,
        songId,
      },
    });
  }

  /**
   * Follow an artist
   */
  async followArtist(followerId: string, artistId: string): Promise<void> {
    await this.prisma.follow.upsert({
      where: {
        followerId_artistId: {
          followerId,
          artistId,
        },
      },
      update: {}, // Do nothing if already following
      create: {
        followerId,
        artistId,
      },
    });
  }

  /**
   * Unfollow an artist
   */
  async unfollowArtist(followerId: string, artistId: string): Promise<void> {
    await this.prisma.follow.deleteMany({
      where: {
        followerId,
        artistId,
      },
    });
  }

  /**
   * Check if user is following an artist
   */
  async isFollowing(followerId: string, artistId: string): Promise<boolean> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_artistId: {
          followerId,
          artistId,
        },
      },
    });
    return !!follow;
  }
}
