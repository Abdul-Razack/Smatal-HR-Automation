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
    refetchInterval: (query) => {
      const doc = query.state.data;
      if (!doc) return false;
      const isPending = doc.status === 'QUEUED' || doc.status === 'PROCESSING' || doc.status === 'GENERATING' || doc.status === 'PENDING';
      return isPending ? 3000 : false;
    }
  });

  const useGeneratedDocuments = (filters?: { entityType?: string, entityId?: string }) => useQuery({
    queryKey: ['generated-documents', 'list', filters],
    queryFn: () => documentApi.getAllGeneratedDocuments(filters),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some((doc) => doc.status === 'QUEUED' || doc.status === 'PROCESSING' || doc.status === 'GENERATING' || doc.status === 'PENDING');
      return hasPending ? 3000 : false;
    }
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
