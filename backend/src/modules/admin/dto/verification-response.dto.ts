export interface VerificationDetailResponse {
  id: string;
  artistProfileId: string;
  idType: string;
  idFileUrl: string;
  selfieFileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Artist info for context
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
    reviewedAt: Date;
    rejectionReason?: string | null;
  };
}
