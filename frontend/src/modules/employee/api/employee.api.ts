import { apiClient } from '@/api/client';
import { Employee, EmployeeStatus } from '../types';

export const employeeApi = {
  list: async (params?: { status?: EmployeeStatus; departmentId?: string; page?: number; limit?: number }): Promise<Employee[]> => {
    const response = await apiClient.get('/employees', { params });
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },
  
  getOne: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  getHistory: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/employees/${id}/history`);
    return response.data;
  },

  update: async ({ id, data }: { id: string; data: Partial<Employee> }): Promise<void> => {
    await apiClient.patch(`/employees/${id}`, data);
  },

  activate: async (id: string): Promise<void> => {
    await apiClient.post(`/employees/${id}/activate`);
  },

  terminate: async ({ id, data }: { id: string; data: { terminationDate: string; reason: string } }): Promise<void> => {
    await apiClient.post(`/employees/${id}/terminate`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};
