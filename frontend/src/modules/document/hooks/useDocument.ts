import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/document.api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useDocument = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const useGeneratedDocument = (id: string) => useQuery({
    queryKey: ['generated-documents', id],
    queryFn: () => documentApi.getGeneratedDocument(id),
    enabled: !!id,
  });

  const useGeneratedDocuments = (filters?: { profileId?: string, candidateId?: string, employeeId?: string }) => useQuery({
    queryKey: ['generated-documents', 'list', filters],
    queryFn: () => documentApi.getAllGeneratedDocuments(filters),
  });

  const useTemplate = (id: string) => useQuery({
    queryKey: ['templates', id],
    queryFn: () => documentApi.getTemplate(id),
    enabled: !!id,
  });

  const generateDocument = useMutation({
    mutationFn: documentApi.generateDocument,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['generated-documents'] });
      toast.success('Document generated successfully');
      router.push(`/hr/documents/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to generate document');
    }
  });

  return {
    useGeneratedDocument,
    useGeneratedDocuments,
    useTemplate,
    generateDocument,
  };
};
