export interface VerificationItem {
  id: string;
  artistProfile: {
    id: string;
    stageName: string;
    avatarUrl?: string | null;
    user: {
      name: string;
      email: string;
    };
  };
  idType: 'national_id' | 'passport' | 'driver_license';
  idFileUrl: string;
  selfieFileUrl: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  artistProfileId: string;
}

export interface VerificationDetailResponse extends VerificationItem {}

export interface ApproveVerificationResponse {
  message: string;
  verification: VerificationItem;
}

export interface RejectVerificationResponse {
  message: string;
  verification: VerificationItem;
}

export interface RejectVerificationData {
  rejectionReason: string;
}
