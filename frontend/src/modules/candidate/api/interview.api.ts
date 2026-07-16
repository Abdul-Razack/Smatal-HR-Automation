import { apiClient } from '@/api/client';
import { Interview } from '../types';

export const interviewApi = {
  list: async (candidateId: string): Promise<Interview[]> => {
    const response = await apiClient.get(`/candidates/${candidateId}/interviews`);
    return response.data;
  },

  getOne: async (candidateId: string, interviewId: string): Promise<Interview> => {
    const response = await apiClient.get(`/candidates/${candidateId}/interviews/${interviewId}`);
    return response.data;
  },

  schedule: async ({ candidateId, data }: { candidateId: string; data: Partial<Interview> }): Promise<{ id: string }> => {
    const response = await apiClient.post(`/candidates/${candidateId}/interviews`, data);
    return response.data;
  },

  update: async ({ candidateId, interviewId, data }: { candidateId: string; interviewId: string; data: Partial<Interview> }): Promise<void> => {
    await apiClient.put(`/candidates/${candidateId}/interviews/${interviewId}`, data);
  },

  cancel: async ({ candidateId, interviewId }: { candidateId: string; interviewId: string }): Promise<void> => {
    await apiClient.delete(`/candidates/${candidateId}/interviews/${interviewId}`);
  },

  submitFeedback: async ({ candidateId, interviewId, data }: { candidateId: string; interviewId: string; data: any }): Promise<void> => {
    await apiClient.post(`/candidates/${candidateId}/interviews/${interviewId}/feedback`, data);
  },
};
