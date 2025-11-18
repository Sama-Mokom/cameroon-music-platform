import { apiClient } from '../api-client';
import type {
  VerificationItem,
  VerificationDetailResponse,
  ApproveVerificationResponse,
  RejectVerificationResponse,
  RejectVerificationData,
} from '@/types/admin';

export const adminApi = {
  // Get all pending verifications
  getPendingVerifications: async (): Promise<VerificationItem[]> => {
    const response = await apiClient.get('/admin/verifications');
    return response.data;
  },

  // Get verification details by ID
  getVerificationById: async (id: string): Promise<VerificationDetailResponse> => {
    const response = await apiClient.get(`/admin/verifications/${id}`);
    return response.data;
  },

  // Approve verification
  approveVerification: async (id: string): Promise<ApproveVerificationResponse> => {
    const response = await apiClient.post(`/admin/verifications/${id}/approve`);
    return response.data;
  },

  // Reject verification with reason
  rejectVerification: async (
    id: string,
    data: RejectVerificationData
  ): Promise<RejectVerificationResponse> => {
    const response = await apiClient.post(`/admin/verifications/${id}/reject`, data);
    return response.data;
  },
};
