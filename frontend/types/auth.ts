export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ARTIST' | 'PROMOTER' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  accountType: 'artist' | 'user';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
