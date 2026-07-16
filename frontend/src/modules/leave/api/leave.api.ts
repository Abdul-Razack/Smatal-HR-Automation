import { apiClient } from '@/api/client';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  LeavePolicy,
  Holiday,
  LeaveStatus,
  ApplyLeaveRequestDto,
} from '../types';

export const leaveApi = {
  // Leaves
  applyLeave: async (data: ApplyLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await apiClient.post('/leaves/apply', data);
    return response.data;
  },

  listLeaves: async (params?: {
    status?: LeaveStatus;
    employeeId?: string;
    leaveTypeId?: string;
    page?: number;
    limit?: number;
  }): Promise<LeaveRequest[]> => {
    const response = await apiClient.get('/leaves', { params });
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },

  getLeave: async (id: string): Promise<LeaveRequest> => {
    const response = await apiClient.get(`/leaves/${id}`);
    return response.data;
  },

  approveLeave: async ({ id, data }: { id: string; data: { reason?: string } }): Promise<void> => {
    await apiClient.post(`/leaves/${id}/approve`, data);
  },

  rejectLeave: async ({ id, data }: { id: string; data: { reason: string } }): Promise<void> => {
    await apiClient.post(`/leaves/${id}/reject`, data);
  },

  cancelLeave: async (id: string): Promise<void> => {
    await apiClient.post(`/leaves/${id}/cancel`);
  },

  deleteLeave: async (id: string): Promise<void> => {
    await apiClient.delete(`/leaves/${id}`);
  },

  getLeaveWorkflow: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/leaves/${id}/workflow`);
    return response.data;
  },

  getApprovalHistory: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/leaves/${id}/history`);
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },

  listPendingApprovals: async (params?: { page?: number; limit?: number }): Promise<LeaveRequest[]> => {
    const response = await apiClient.get('/leaves/approvals', { params });
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },

  // Balances
  getLeaveBalance: async (employeeId: string, year?: number): Promise<LeaveBalance[]> => {
    const params = year ? { year } : {};
    const response = await apiClient.get(`/leaves/balance/${employeeId}`, { params });
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },

  // Leave Types
  listLeaveTypes: async (): Promise<LeaveType[]> => {
    const response = await apiClient.get('/leaves/types');
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },

  // Holidays
  listHolidays: async (params?: { year?: number; branchId?: string }): Promise<Holiday[]> => {
    const response = await apiClient.get('/leaves/holidays', { params });
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },
};
