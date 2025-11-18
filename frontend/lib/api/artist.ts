import { apiClient } from '../api-client';
import type {
  ArtistProfile,
  CreateArtistProfileData,
  UpdateArtistProfileData,
  UploadResponse,
  VerificationUploadResponse,
} from '@/types/artist';

// Artist Profile CRUD
export const artistApi = {
  // Create or update profile
  createProfile: async (data: CreateArtistProfileData): Promise<ArtistProfile> => {
    const response = await apiClient.post('/artists', data);
    return response.data;
  },

  // Update own profile
  updateProfile: async (data: UpdateArtistProfileData): Promise<ArtistProfile> => {
    const response = await apiClient.put('/artists/me', data);
    return response.data;
  },

  // Get own profile
  getMyProfile: async (): Promise<ArtistProfile> => {
    const response = await apiClient.get('/artists/me');
    return response.data;
  },

  // Get all profiles (public)
  getAllProfiles: async (): Promise<ArtistProfile[]> => {
    const response = await apiClient.get('/artists');
    return response.data;
  },

  // Get profile by ID (public)
  getProfileById: async (id: string): Promise<ArtistProfile> => {
    const response = await apiClient.get(`/artists/${id}`);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    // Don't set Content-Type header - let browser set it with boundary
    const response = await apiClient.post('/artists/uploads/avatar', formData);
    return response.data;
  },

  // Upload cover
  uploadCover: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('cover', file);

    // Don't set Content-Type header - let browser set it with boundary
    const response = await apiClient.post('/artists/uploads/cover', formData);
    return response.data;
  },

  // Upload verification documents
  uploadVerification: async (
    idFile: File,
    selfieFile: File,
    idType: 'national_id' | 'passport' | 'driver_license'
  ): Promise<VerificationUploadResponse> => {
    const formData = new FormData();
    formData.append('files', idFile);
    formData.append('files', selfieFile);
    formData.append('idType', idType);

    // Don't set Content-Type header - let browser set it with boundary
    const response = await apiClient.post('/artists/uploads/verification', formData);
    return response.data;
  },
};
