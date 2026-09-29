import { apiClient } from '@/api/client';
import { Employee, EmployeeStatus, CreateEmployeeInput, UpdateEmployeeInput, TransitionLifecycleInput } from '../types';

export const employeeApi = {
  list: async (params?: {
    status?: EmployeeStatus;
    departmentId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Employee[]> => {
    const response = await apiClient.get('/employees', { params });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.data || response.data?.items || [];
  },

  getOne: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeInput): Promise<Employee> => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  getHistory: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/employees/${id}/history`);
    return response.data;
  },

  update: async ({ id, data }: { id: string; data: UpdateEmployeeInput }): Promise<void> => {
    await apiClient.patch(`/employees/${id}`, data);
  },

  activate: async (id: string): Promise<void> => {
    await apiClient.post(`/employees/${id}/activate`);
  },

  transitionLifecycle: async ({
    id,
    data,
  }: {
    id: string;
    data: TransitionLifecycleInput;
  }): Promise<{ success: boolean; status: EmployeeStatus }> => {
    const response = await apiClient.post(`/employees/${id}/lifecycle/transition`, data);
    return response.data;
  },

  terminate: async ({ id, data }: { id: string; data: { terminationDate: string; reason: string } }): Promise<void> => {
    await apiClient.post(`/employees/${id}/terminate`, data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },

  // Resignation APIs
  submitResignation: async (
    id: string,
    data: {
      resignationDate: string;
      reason: string;
      noticePeriodDays?: number;
      lastWorkingDate?: string;
    },
  ): Promise<any> => {
    const response = await apiClient.post(`/employees/${id}/resignation`, data);
    return response.data;
  },

  getResignation: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/employees/${id}/resignation`);
    return response.data;
  },

  updateResignation: async (
    id: string,
    data: {
      resignationDate?: string;
      reason?: string;
      noticePeriodDays?: number;
      lastWorkingDate?: string;
    },
  ): Promise<any> => {
    const response = await apiClient.patch(`/employees/${id}/resignation`, data);
    return response.data;
  },

  acceptResignation: async (
    id: string,
    data?: { agreedLastWorkingDate?: string; comments?: string },
  ): Promise<any> => {
    const response = await apiClient.post(`/employees/${id}/resignation/accept`, data || {});
    return response.data;
  },

  withdrawResignation: async (
    id: string,
    data?: { reason?: string },
  ): Promise<any> => {
    const response = await apiClient.post(`/employees/${id}/resignation/withdraw`, data || {});
    return response.data;
  },

  // Clearance APIs
  initiateClearance: async (id: string): Promise<any> => {
    const response = await apiClient.post(`/employees/${id}/clearance/initiate`);
    return response.data;
  },

  getClearanceList: async (
    id: string,
  ): Promise<{ clearances: any[]; isAllCleared: boolean; pendingCount: number }> => {
    const response = await apiClient.get(`/employees/${id}/clearance`);
    return response.data;
  },

  updateClearance: async (
    id: string,
    department: string,
    data: { status: string; remarks?: string },
  ): Promise<any> => {
    const response = await apiClient.put(`/employees/${id}/clearance/${department}`, data);
    return response.data;
  },

  // Exit Completion API
  completeExit: async (
    id: string,
    data?: { finalLastWorkingDate?: string; notes?: string },
  ): Promise<any> => {
    const response = await apiClient.post(`/employees/${id}/exit/complete`, data || {});
    return response.data;
  },

  // Exit Workspace Overview API
  getExitOverview: async (): Promise<any> => {
    const response = await apiClient.get('/employees/exit/overview');
    return response.data;
  },
};
