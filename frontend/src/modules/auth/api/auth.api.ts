import { apiClient } from '@/api/client';
import { LoginFormData } from '../schemas/login.schema';
import { AuthResponse, UserSession } from '../types';

export const authApi = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const { rememberMe, ...payload } = credentials;
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refresh: async (data: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }> => {
    // Explicitly import and use axios directly to bypass interceptor if we wanted, 
    // but the interceptor handles skipping /auth/refresh for 401s now.
    const response = await apiClient.post('/auth/refresh', data);
    return response.data;
  },

  getMe: async (): Promise<UserSession> => {
    const response = await apiClient.get<UserSession>('/users/me');
    return response.data;
  },
};
