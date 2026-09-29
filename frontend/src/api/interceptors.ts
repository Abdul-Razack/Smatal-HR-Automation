import { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store';
import { authApi } from '@/modules/auth/api/auth.api';
import { storage } from '@/utils/storage';
import { toast } from 'sonner';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (apiClient: AxiosInstance) => {
  // Request Interceptor
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Always get latest from storage for interceptors
      const token = storage.get('access_token');
      const companyId = storage.get('company_id');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (companyId && config.headers) {
        config.headers['x-company-id'] = companyId;
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response Interceptor
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Unwrap the ApiResponse envelope from the backend if it exists
      if (response.data && response.data.data !== undefined && response.data.meta !== undefined) {
        response.data = response.data.data;
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;

      // Global Error Toasts
      if (status !== 401 && !originalRequest?.url?.includes('/auth/refresh')) {
        const data = error.response?.data as any;
        const message = data?.message || error.message || 'An unexpected error occurred';
        
        if (status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else if (status === 404) {
          toast.error('Resource not found.');
        } else if (status === 409) {
          toast.error(message || 'Conflict occurred.');
        } else if (status && status >= 500) {
          toast.error('A server error occurred. Please try again later.');
        } else if (status) {
          // Bad requests (400) or others
          toast.error(message);
        }
      }

      // Pass through if not 401 or if it's already a retry
      // Also pass through if it's the login route itself failing with 401!
      if (
        status !== 401 || 
        !originalRequest || 
        originalRequest._retry || 
        originalRequest.url?.includes('/auth/login')
      ) {
        return Promise.reject(error);
      }

      // Avoid looping on the refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login?error=session_expired';
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = storage.get('refresh_token');

      if (!refreshToken) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const data = await authApi.refresh({ refreshToken });
        
        useAuthStore.getState().refresh(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login?error=session_expired';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};
