import { apiClient } from '@/api/client';
import { Notification } from '../types';

export const notificationApi = {
  list: async (params?: { unreadOnly?: boolean; limit?: number; offset?: number }): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications', { params });
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },
  
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },
};
