export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export interface AvatarUploadResponse extends UploadResponse {
  message: string;
}

export interface CoverUploadResponse extends UploadResponse {
  message: string;
}

export interface VerificationUploadResponse {
  idFileUrl: string;
  selfieFileUrl: string;
  message: string;
}
