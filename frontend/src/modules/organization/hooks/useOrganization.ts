import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../api/organization.api';
import { toast } from 'sonner';

export const useOrganization = () => {
  const queryClient = useQueryClient();

  const useCompany = () => useQuery({
    queryKey: ['company', 'me'],
    queryFn: organizationApi.getMyCompany,
  });

  const useBranches = () => useQuery({
    queryKey: ['branches'],
    queryFn: organizationApi.listBranches,
  });

  const useDepartments = () => useQuery({
    queryKey: ['departments'],
    queryFn: organizationApi.listDepartments,
  });

  const useDesignations = () => useQuery({
    queryKey: ['designations'],
    queryFn: organizationApi.listDesignations,
  });

  const createDepartment = useMutation({
    mutationFn: organizationApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create department');
    }
  });

  const createBranch = useMutation({
    mutationFn: organizationApi.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('Branch created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create branch');
    }
  });

  const createDesignation = useMutation({
    mutationFn: organizationApi.createDesignation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success('Designation created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create designation');
    }
  });

  return {
    useCompany,
    useBranches,
    useDepartments,
    useDesignations,
    createDepartment,
    createBranch,
    createDesignation,
  };
};
