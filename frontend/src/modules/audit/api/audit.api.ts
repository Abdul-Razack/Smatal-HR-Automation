import { apiClient } from '@/api/client';
import { AuditHistoryResponse } from '../types';

export const auditApi = {
  getAuditHistory: async (params?: { entityBusinessId?: string; limit?: number; offset?: number }): Promise<AuditHistoryResponse> => {
    const response = await apiClient.get('/audit', { params });
    // Normalize response if backend doesn't return total
    if (Array.isArray(response.data)) {
      return { items: response.data, total: response.data.length };
    }
    return response.data;
  },
};
