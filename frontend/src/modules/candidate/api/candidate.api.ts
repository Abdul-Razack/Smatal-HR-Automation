import { apiClient } from '@/api/client';
import { Candidate, CandidateStatus } from '../types';

export const candidateApi = {
  list: async (params?: { status?: CandidateStatus; page?: number; limit?: number }): Promise<Candidate[]> => {
    const response = await apiClient.get('/candidates', { params });
    // Assuming backend returns an array or paginated response. Normalizing to array for now.
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },
  
  getOne: async (id: string): Promise<Candidate> => {
    const response = await apiClient.get(`/candidates/${id}`);
    return response.data;
  },

  create: async (data: Partial<Candidate>): Promise<{ id: string }> => {
    const response = await apiClient.post('/candidates', data);
    return response.data;
  },

  update: async ({ id, data }: { id: string; data: Partial<Candidate> }): Promise<void> => {
    await apiClient.patch(`/candidates/${id}`, data);
  },

  submit: async (id: string): Promise<void> => {
    await apiClient.post(`/candidates/${id}/submit`);
  },

  screen: async (id: string): Promise<void> => {
    await apiClient.post(`/candidates/${id}/screen`);
  },

  select: async (id: string): Promise<void> => {
    await apiClient.post(`/candidates/${id}/select`);
  },

  reject: async ({ id, reason }: { id: string; reason?: string }): Promise<void> => {
    await apiClient.post(`/candidates/${id}/reject`, { reason });
  },

  withdraw: async ({ id, reason }: { id: string; reason?: string }): Promise<void> => {
    await apiClient.post(`/candidates/${id}/withdraw`, { reason });
  },

  convert: async ({ id, data }: { id: string; data: any }): Promise<{ employeeId: string }> => {
    const response = await apiClient.post(`/candidates/${id}/convert`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/candidates/${id}`);
  },

  getTimeline: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/candidates/${id}/timeline`);
    return response.data;
  },
};
