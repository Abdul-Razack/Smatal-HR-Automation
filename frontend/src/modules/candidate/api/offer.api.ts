import { apiClient } from '@/api/client';
import { Offer } from '../types';

export const offerApi = {
  list: async (candidateId: string): Promise<Offer[]> => {
    const response = await apiClient.get(`/candidates/${candidateId}/offers`);
    return response.data;
  },

  generate: async ({ candidateId, data }: { candidateId: string; data: Partial<Offer> }): Promise<{ id: string }> => {
    const response = await apiClient.post(`/candidates/${candidateId}/offers`, data);
    return response.data;
  },

  update: async ({ candidateId, offerId, data }: { candidateId: string; offerId: string; data: Partial<Offer> }): Promise<void> => {
    await apiClient.put(`/candidates/${candidateId}/offers/${offerId}`, data);
  },

  accept: async ({ candidateId, offerId }: { candidateId: string; offerId: string }): Promise<void> => {
    await apiClient.post(`/candidates/${candidateId}/offers/${offerId}/accept`);
  },

  reject: async ({ candidateId, offerId }: { candidateId: string; offerId: string }): Promise<void> => {
    await apiClient.post(`/candidates/${candidateId}/offers/${offerId}/reject`);
  },
};
