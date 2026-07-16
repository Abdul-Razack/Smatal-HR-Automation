import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leave.api';
import { leaveKeys } from './useLeaveQueries';

export const useApplyLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.applyLeave,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() });
      if (data.employeeId) {
        queryClient.invalidateQueries({ queryKey: leaveKeys.balances(data.employeeId) });
      }
    },
  });
};

export const useApproveLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.approveLeave,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.workflow(variables.id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.history(variables.id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.approvals() });
    },
  });
};

export const useRejectLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.rejectLeave,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.workflow(variables.id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.history(variables.id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.approvals() });
    },
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.cancelLeave,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() });
    },
  });
};

export const useDeleteLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.deleteLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.lists() });
    },
  });
};
