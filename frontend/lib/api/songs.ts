import { Song, UploadSongResponse } from '@/types/song';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface UploadSongData {
  title: string;
  genre?: string;
  audioFile: File;
}

/**
 * Upload a new song with audio file
 * POST /api/songs/upload
 */
export async function uploadSong(
  data: UploadSongData,
  onProgress?: (progress: number) => void
): Promise<UploadSongResponse> {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.genre) {
    formData.append('genre', data.genre);
  }
  formData.append('audio', data.audioFile);

  // Get token from auth store
  const { tokens } = useAuthStore.getState();
  if (!tokens?.accessToken) {
    throw new Error('Authentication required. Please login.');
  }
  const token = tokens.accessToken;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse server response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error occurred during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    xhr.open('POST', `${API_URL}/api/songs/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}

/**
 * Get all songs uploaded by the authenticated artist
 * GET /api/songs/me
 */
export async function getMySongs(): Promise<Song[]> {
  const { tokens } = useAuthStore.getState();
  if (!tokens?.accessToken) {
    throw new Error('Authentication required. Please login.');
  }
  const token = tokens.accessToken;

  const response = await fetch(`${API_URL}/api/songs/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch songs' }));
    throw new Error(error.message || 'Failed to fetch songs');
  }

  return response.json();
}

/**
 * Get a single song by ID (public endpoint)
 * GET /api/songs/:id
 */
export async function getSongById(songId: string): Promise<Song> {
  const response = await fetch(`${API_URL}/api/songs/${songId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch song' }));
    throw new Error(error.message || 'Failed to fetch song');
  }

  return response.json();
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
