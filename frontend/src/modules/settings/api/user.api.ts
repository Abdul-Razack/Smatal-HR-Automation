import { apiClient } from '@/api/client';

export const userApi = {
  getMe: async (): Promise<any> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  
  getUserById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};
