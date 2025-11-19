export interface FingerprintResultDto {
  fingerprint: any; // Landmark data from stream-audio-fingerprint
  duration: number; // Duration in seconds
  sampleRate: number; // Sample rate used
}

export interface DuplicateMatchDto {
  songId: string;
  title: string;
  artistName: string;
  similarity: number; // 0-100%
  matchingLandmarks: number;
}

export interface CheckDuplicatesResultDto {
  matches: DuplicateMatchDto[];
  threshold: number;
}
