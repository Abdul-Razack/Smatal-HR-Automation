import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '../api/template.api';
import { toast } from 'sonner';

export const useTemplate = () => {
  const queryClient = useQueryClient();

  const useTemplates = () => useQuery({
    queryKey: ['templates'],
    queryFn: templateApi.listTemplates,
  });

  const createTemplate = useMutation({
    mutationFn: templateApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create template');
    }
  });

  return {
    useTemplates,
    createTemplate,
  };
};
