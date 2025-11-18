// Artist Profile Types for Milestone 3

export interface ArtistProfile {
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
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
  verification?: {
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string | null;
  };
}

export interface CreateArtistProfileData {
  stageName?: string;
  bio?: string;
  genres?: string[];
  tags?: string[];
  phoneNumber?: string;
}

export interface UpdateArtistProfileData {
  stageName?: string;
  bio?: string;
  genres?: string[];
  tags?: string[];
  phoneNumber?: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  message: string;
}

export interface VerificationUploadResponse {
  idFileUrl: string;
  selfieFileUrl: string;
  message: string;
}

export interface VerificationDetail {
  id: string;
  artistProfileId: string;
  idType: string;
  idFileUrl: string;
  selfieFileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  artistProfile: {
    id: string;
    stageName: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface VerificationActionResponse {
  message: string;
  verification: {
    id: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    artistProfileId: string;
    reviewedBy: string;
    reviewedAt: string;
    rejectionReason?: string | null;
  };
}
