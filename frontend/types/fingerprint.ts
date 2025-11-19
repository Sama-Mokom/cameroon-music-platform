export interface DuplicateMatch {
  songId: string;
  title: string;
  artistName: string;
  similarity: number; // 0-100%
  matchingLandmarks: number;
}

export interface DuplicateMatchRecord {
  id: string;
  originalSongId: string;
  duplicateSongId: string;
  similarity: number;
  matchingLandmarks: number;
  status: 'PENDING' | 'REVIEWED' | 'CONFIRMED_DUPLICATE' | 'FALSE_POSITIVE' | 'REMIX';
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  originalSong: {
    id: string;
    title: string;
    audioUrl: string;
    artist: {
      id: string;
      name: string;
    };
  };
  duplicateSong: {
    id: string;
    title: string;
    audioUrl: string;
    artist: {
      id: string;
      name: string;
    };
  };
}

export interface UploadWithDuplicates {
  message: string;
  song: any;
  duplicates?: DuplicateMatch[];
}
