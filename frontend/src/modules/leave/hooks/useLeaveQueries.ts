import { useQuery } from '@tanstack/react-query';
import { leaveApi } from '../api/leave.api';
import { LeaveStatus } from '../types';

export const leaveKeys = {
  all: ['leaves'] as const,
  lists: () => [...leaveKeys.all, 'list'] as const,
  list: (filters: string) => [...leaveKeys.lists(), { filters }] as const,
  details: () => [...leaveKeys.all, 'detail'] as const,
  detail: (id: string) => [...leaveKeys.details(), id] as const,
  workflow: (id: string) => [...leaveKeys.detail(id), 'workflow'] as const,
  history: (id: string) => [...leaveKeys.detail(id), 'history'] as const,
  approvals: () => [...leaveKeys.all, 'approvals'] as const,
  balances: (employeeId: string) => [...leaveKeys.all, 'balance', employeeId] as const,
  types: () => ['leave-types'] as const,
  holidays: () => ['holidays'] as const,
};

export const useLeaves = (params?: {
  status?: LeaveStatus;
  employeeId?: string;
  leaveTypeId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: leaveKeys.list(JSON.stringify(params)),
    queryFn: () => leaveApi.listLeaves(params),
  });
};

export const useLeave = (id: string) => {
  return useQuery({
    queryKey: leaveKeys.detail(id),
    queryFn: () => leaveApi.getLeave(id),
    enabled: !!id,
  });
};

export const useLeaveWorkflow = (id: string) => {
  return useQuery({
    queryKey: leaveKeys.workflow(id),
    queryFn: () => leaveApi.getLeaveWorkflow(id),
    enabled: !!id,
  });
};

export const useApprovalHistory = (id: string) => {
  return useQuery({
    queryKey: leaveKeys.history(id),
    queryFn: () => leaveApi.getApprovalHistory(id),
    enabled: !!id,
  });
};

export const usePendingApprovals = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: leaveKeys.approvals(),
    queryFn: () => leaveApi.listPendingApprovals(params),
  });
};

export const useLeaveBalance = (employeeId: string, year?: number) => {
  return useQuery({
    queryKey: leaveKeys.balances(employeeId),
    queryFn: () => leaveApi.getLeaveBalance(employeeId, year),
    enabled: !!employeeId,
  });
};

export const useLeaveTypes = () => {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: () => leaveApi.listLeaveTypes(),
  });
};

export const useHolidays = (params?: { year?: number; branchId?: string }) => {
  return useQuery({
    queryKey: leaveKeys.holidays(),
    queryFn: () => leaveApi.listHolidays(params),
  });
};
