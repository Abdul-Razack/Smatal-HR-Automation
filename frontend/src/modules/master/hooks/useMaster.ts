import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { masterApi } from '../api/master.api';
import { toast } from 'sonner';

export const useMaster = () => {
  const queryClient = useQueryClient();

  const useDocumentTypes = () => useQuery({
    queryKey: ['documentTypes'],
    queryFn: masterApi.listDocumentTypes,
  });

  const useFieldGroups = () => useQuery({
    queryKey: ['fieldGroups'],
    queryFn: masterApi.listFieldGroups,
  });

  const useFieldDefinitions = () => useQuery({
    queryKey: ['fieldDefinitions'],
    queryFn: masterApi.listFieldDefinitions,
  });

  const createDocumentType = useMutation({
    mutationFn: masterApi.createDocumentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTypes'] });
      toast.success('Document Type created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create document type');
    }
  });

  const createFieldGroup = useMutation({
    mutationFn: masterApi.createFieldGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldGroups'] });
      toast.success('Field Group created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create field group');
    }
  });

  const createFieldDefinition = useMutation({
    mutationFn: masterApi.createFieldDefinition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldDefinitions'] });
      toast.success('Field Definition created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create field definition');
    }
  });

  return {
    useDocumentTypes,
    useFieldGroups,
    useFieldDefinitions,
    createDocumentType,
    createFieldGroup,
    createFieldDefinition,
  };
};
