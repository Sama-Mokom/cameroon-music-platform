export class SongResponseDto {
  id: string;
  title: string;
  genre: string | null;
  artistId: string;
  audioUrl: string;
  publicId: string;
  duration: number | null;
  size: number | null;
  format: string | null;
  createdAt: Date;
  updatedAt: Date;
  artist?: {
    id: string;
    name: string;
    email: string;
  };
}

export class UploadSongResponseDto {
  message: string;
  song: SongResponseDto;
}
