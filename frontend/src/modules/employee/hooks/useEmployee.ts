import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '../api/employee.api';
import { toast } from 'sonner';

export const useEmployee = () => {
  const queryClient = useQueryClient();

  const useEmployees = (params?: any) => useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeApi.list(params),
  });

  const useEmployeeDetail = (id: string) => useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeeApi.getOne(id),
    enabled: !!id,
  });

  const useEmploymentHistory = (id: string) => useQuery({
    queryKey: ['employees', id, 'history'],
    queryFn: () => employeeApi.getHistory(id),
    enabled: !!id,
  });

  const createEmployee = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create employee');
    },
  });

  const updateEmployee = useMutation({
    mutationFn: employeeApi.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Update failed');
    }
  });

  const activateEmployee = useMutation({
    mutationFn: employeeApi.activate,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['employees', id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee activated');
    }
  });

  const terminateEmployee = useMutation({
    mutationFn: employeeApi.terminate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee terminated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Termination failed');
    }
  });

  const transitionLifecycle = useMutation({
    mutationFn: employeeApi.transitionLifecycle,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`Lifecycle transitioned to ${variables.data.status}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Lifecycle transition failed');
    }
  });

  const useResignationDetail = (id: string) => useQuery({
    queryKey: ['employees', id, 'resignation'],
    queryFn: () => employeeApi.getResignation(id),
    enabled: !!id,
  });

  const useClearanceList = (id: string) => useQuery({
    queryKey: ['employees', id, 'clearance'],
    queryFn: () => employeeApi.getClearanceList(id),
    enabled: !!id,
  });

  const useExitOverview = () => useQuery({
    queryKey: ['exit-overview'],
    queryFn: () => employeeApi.getExitOverview(),
  });

  const submitResignation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => employeeApi.submitResignation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id, 'resignation'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['exit-overview'] });
      toast.success('Resignation submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to submit resignation');
    },
  });

  const acceptResignation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => employeeApi.acceptResignation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id, 'resignation'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id, 'clearance'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['exit-overview'] });
      toast.success('Resignation accepted. Notice period initiated.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to accept resignation');
    },
  });

  const withdrawResignation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => employeeApi.withdrawResignation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id, 'resignation'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['exit-overview'] });
      toast.success('Resignation withdrawn successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to withdraw resignation');
    },
  });

  const initiateClearance = useMutation({
    mutationFn: (id: string) => employeeApi.initiateClearance(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['employees', id, 'clearance'] });
      toast.success('Clearance process initiated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to initiate clearance');
    },
  });

  const updateClearance = useMutation({
    mutationFn: ({ id, department, data }: { id: string; department: string; data: any }) =>
      employeeApi.updateClearance(id, department, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id, 'clearance'] });
      queryClient.invalidateQueries({ queryKey: ['exit-overview'] });
      toast.success('Department clearance updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update clearance');
    },
  });

  const completeExit = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => employeeApi.completeExit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id, 'resignation'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id, 'clearance'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['exit-overview'] });
      toast.success('Exit completed successfully. Employee is now RELIEVED.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to complete exit');
    },
  });

  return {
    useEmployees,
    useEmployeeDetail,
    useEmploymentHistory,
    useResignationDetail,
    useClearanceList,
    useExitOverview,
    createEmployee,
    updateEmployee,
    activateEmployee,
    terminateEmployee,
    transitionLifecycle,
    submitResignation,
    acceptResignation,
    withdrawResignation,
    initiateClearance,
    updateClearance,
    completeExit,
  };
};
