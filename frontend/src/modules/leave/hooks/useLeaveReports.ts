import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export function useLeaveDashboardMetrics() {
  return useQuery({
    queryKey: ['leave-dashboard-metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/leave/reports/dashboard');
      return response.data;
    },
  });
}

export function useLeaveCharts() {
  return useQuery({
    queryKey: ['leave-charts'],
    queryFn: async () => {
      const response = await apiClient.get('/leave/reports/charts');
      return response.data;
    },
  });
}

export function useLeaveReports(params: {
  type: string;
  page: number;
  limit: number;
  [key: string]: any;
}) {
  return useQuery({
    queryKey: ['leave-reports-data', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const response = await apiClient.get(`/leave/reports/data?${searchParams.toString()}`);
      return response.data;
    },
  });
}

export function useExportLeaveReport() {
  return useMutation({
    mutationFn: async (params: { format: 'csv' | 'pdf'; type: string; [key: string]: any }) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      
      const response = await apiClient.get(`/leave/reports/export?${searchParams.toString()}`, {
        responseType: 'blob', // Important for downloading files
      });

      return response.data;
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leave-report-${variables.type}-${Date.now()}.${variables.format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    },
  });
}
