// Song types matching backend SongResponseDto

export interface Song {
  id: string;
  title: string;
  genre: string | null;
  artistId: string;
  audioUrl: string;
  publicId: string;
  duration: number | null; // Duration in seconds
  size: number | null; // File size in bytes
  format: string | null; // Audio format (mp3, wav, etc.)
  createdAt: string;
  updatedAt: string;
  artist?: {
    id: string;
    name: string;
    email: string;
    artistProfile?: {
      id: string;
      stageName: string | null;
      avatarUrl: string | null;
    };
  };
}

export interface UploadSongResponse {
  message: string;
  song: Song;
}

export interface UploadSongDto {
  title: string;
  genre?: string;
}

// Frontend-only types for UI state
export interface SongUploadProgress {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  error?: string;
}

export interface SongFormData {
  title: string;
  genre: string;
  audioFile: File | null;
}
