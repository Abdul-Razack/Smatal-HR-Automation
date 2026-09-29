import { apiClient } from '@/api/client';
import { DashboardMetrics, SearchResult, ReportData } from '../types';

export const analyticsApi = {
  getDashboard: async (type: 'HR' | 'ORG' | 'DOC' | 'ATS'): Promise<DashboardMetrics> => {
    const response = await apiClient.get('/analytics/dashboard', { params: { type } });
    return response.data?.data || response.data;
  },

  getDashboardSummary: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get('/dashboard/summary');
    return response.data?.data || response.data;
  },

  globalSearch: async (query: string, limit?: number): Promise<SearchResult[]> => {
    if (!query) return [];
    const response = await apiClient.get('/analytics/search', { params: { q: query, limit } });
    return response.data;
  },

  getReport: async (type: string, filters?: Record<string, any>): Promise<ReportData> => {
    const response = await apiClient.get('/analytics/report', { params: { type, ...filters } });
    return response.data;
  },
};
