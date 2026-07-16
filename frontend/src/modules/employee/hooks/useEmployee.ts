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

  return {
    useEmployees,
    useEmployeeDetail,
    useEmploymentHistory,
    updateEmployee,
    activateEmployee,
    terminateEmployee,
  };
};
