import { apiClient } from '../api-client';

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

/**
 * Get current user's statistics
 */
export async function getMyStatistics(): Promise<UserStatistics | ArtistStatistics> {
  const response = await apiClient.get('/statistics/me');
  return response.data;
}

/**
 * Get artist statistics by ID
 */
export async function getArtistStatistics(artistId: string): Promise<ArtistStatistics> {
  const response = await apiClient.get(`/statistics/artist/${artistId}`);
  return response.data;
}

/**
 * Track a song play
 */
export async function trackSongPlay(songId: string): Promise<void> {
  await apiClient.post(`/statistics/play/${songId}`);
}

/**
 * Add song to favorites
 */
export async function addToFavorites(songId: string): Promise<void> {
  await apiClient.post(`/statistics/favorites/${songId}`);
}

/**
 * Remove song from favorites
 */
export async function removeFromFavorites(songId: string): Promise<void> {
  await apiClient.delete(`/statistics/favorites/${songId}`);
}

/**
 * Check if song is in favorites
 */
export async function isSongFavorite(songId: string): Promise<boolean> {
  const response = await apiClient.get(`/statistics/favorites/${songId}/check`);
  return response.data.isFavorite;
}

/**
 * Get user's favorite songs
 */
export async function getFavorites() {
  const response = await apiClient.get('/statistics/favorites');
  return response.data;
}

/**
 * Get user's playlists
 */
export async function getPlaylists() {
  const response = await apiClient.get('/statistics/playlists');
  return response.data;
}

/**
 * Create a new playlist
 */
export async function createPlaylist(name: string, description?: string) {
  const response = await apiClient.post('/statistics/playlists', {
    name,
    description,
  });
  return response.data;
}

/**
 * Add song to playlist
 */
export async function addSongToPlaylist(playlistId: string, songId: string): Promise<void> {
  await apiClient.post(`/statistics/playlists/${playlistId}/songs/${songId}`);
}

/**
 * Remove song from playlist
 */
export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  await apiClient.delete(`/statistics/playlists/${playlistId}/songs/${songId}`);
}

/**
 * Follow an artist
 */
export async function followArtist(artistId: string): Promise<void> {
  await apiClient.post(`/statistics/follow/${artistId}`);
}

/**
 * Unfollow an artist
 */
export async function unfollowArtist(artistId: string): Promise<void> {
  await apiClient.delete(`/statistics/follow/${artistId}`);
}

/**
 * Check if following an artist
 */
export async function isFollowingArtist(artistId: string): Promise<boolean> {
  const response = await apiClient.get(`/statistics/follow/${artistId}/check`);
  return response.data.isFollowing;
}
