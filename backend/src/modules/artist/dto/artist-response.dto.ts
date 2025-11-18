export interface ArtistProfileResponse {
  id: string;
  userId: string;
  stageName: string | null;
  bio: string | null;
  genres: string[];
  tags: string[];
  phoneNumber: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Include user info for public profiles
  user?: {
    name: string;
    email: string;
  };
  // Include verification status
  verification?: {
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string | null;
  };
}
