import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '../api/organization.api';
import { toast } from 'sonner';

export const useOrganization = () => {
  const queryClient = useQueryClient();

  const useCompany = () => useQuery({
    queryKey: ['company', 'me'],
    queryFn: organizationApi.getMyCompany,
  });

  const useCompanySettings = () => useQuery({
    queryKey: ['company', 'settings'],
    queryFn: organizationApi.getCompanySettings,
  });

  const updateCompanySettings = useMutation({
    mutationFn: organizationApi.updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'me'] });
      toast.success('Company settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update company settings');
    }
  });

  const uploadLogo = useMutation({
    mutationFn: organizationApi.uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'me'] });
      toast.success('Company logo uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload logo');
    }
  });

  const removeLogo = useMutation({
    mutationFn: organizationApi.removeLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'me'] });
      toast.success('Company logo removed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove logo');
    }
  });

  const uploadSignature = useMutation({
    mutationFn: organizationApi.uploadSignature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'me'] });
      toast.success('Authorized signature uploaded successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload signature');
    }
  });

  const removeSignature = useMutation({
    mutationFn: organizationApi.removeSignature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['company', 'me'] });
      toast.success('Authorized signature removed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove signature');
    }
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
    useCompanySettings,
    updateCompanySettings,
    uploadLogo,
    removeLogo,
    uploadSignature,
    removeSignature,
    useBranches,
    useDepartments,
    useDesignations,
    createDepartment,
    createBranch,
    createDesignation,
  };
};
