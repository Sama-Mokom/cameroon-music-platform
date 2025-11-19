import apiClient from '../api-client';
import { DuplicateMatchRecord } from '../../types/fingerprint';

/**
 * Get duplicate matches for a specific song
 */
export async function getMatchesForSong(songId: string): Promise<DuplicateMatchRecord[]> {
  const response = await apiClient.get(`/fingerprinting/matches/${songId}`);
  return response.data;
}

/**
 * Get all pending duplicate matches (admin only)
 */
export async function getPendingMatches(): Promise<DuplicateMatchRecord[]> {
  const response = await apiClient.get('/fingerprinting/pending');
  return response.data;
}

/**
 * Update duplicate match status (admin action)
 */
export async function updateMatchStatus(
  matchId: string,
  status: string,
  resolution?: string,
  notes?: string
): Promise<DuplicateMatchRecord> {
  const response = await apiClient.post(`/admin/duplicates/${matchId}/update`, {
    status,
    resolution,
    notes,
  });
  return response.data;
}
