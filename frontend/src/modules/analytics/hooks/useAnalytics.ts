import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics.api';

export const useAnalytics = () => {
  const useDashboard = (type: 'HR' | 'ORG' | 'DOC' | 'ATS') => useQuery({
    queryKey: ['dashboard', type],
    queryFn: () => analyticsApi.getDashboard(type),
  });

  const useSearch = (query: string, limit?: number) => useQuery({
    queryKey: ['search', query, limit],
    queryFn: () => analyticsApi.globalSearch(query, limit),
    enabled: !!query && query.length > 2,
  });

  const useReport = (type: string, filters?: Record<string, any>) => useQuery({
    queryKey: ['report', type, filters],
    queryFn: () => analyticsApi.getReport(type, filters),
    enabled: !!type,
  });

  return {
    useDashboard,
    useSearch,
    useReport,
  };
};
