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
      const isPending = doc.status === 'GENERATING' || doc.status === 'PENDING';
      return isPending ? 3000 : false;
    }
  });

  const useGeneratedDocuments = (filters?: {
    entityType?: string;
    entityId?: string;
    employeeId?: string;
    candidateId?: string;
    documentTypeId?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => useQuery({
    queryKey: ['generated-documents', 'list', filters],
    queryFn: () => documentApi.getAllGeneratedDocuments(filters),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasPending = data.some((doc) => doc.status === 'GENERATING' || doc.status === 'PENDING');
      return hasPending ? 3000 : false;
    }
  });

  const useEmployeeDocuments = (employeeId: string) => useQuery({
    queryKey: ['generated-documents', 'employee', employeeId],
    queryFn: () => documentApi.getEmployeeDocuments(employeeId),
    enabled: !!employeeId,
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

  const useDocumentTypes = (filters?: { search?: string; isActive?: boolean }) =>
    useQuery({
      queryKey: ['document-types', filters],
      queryFn: () => documentApi.listDocumentTypes(filters),
    });

  const useDocumentType = (id: string) =>
    useQuery({
      queryKey: ['document-types', id],
      queryFn: () => documentApi.getDocumentType(id),
      enabled: !!id,
    });

  const createDocumentType = useMutation({
    mutationFn: documentApi.createDocumentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-types'] });
      toast.success('Document type created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create document type');
    },
  });

  const updateDocumentType = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; description?: string | null };
    }) => documentApi.updateDocumentType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-types'] });
      toast.success('Document type updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update document type');
    },
  });

  const updateDocumentTypeStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      documentApi.updateDocumentTypeStatus(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-types'] });
      toast.success(
        `Document type ${variables.isActive ? 'activated' : 'deactivated'} successfully`,
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update document type status',
      );
    },
  });

  return {
    useDocumentTypes,
    useDocumentType,
    createDocumentType,
    updateDocumentType,
    updateDocumentTypeStatus,
    useGeneratedDocument,
    useGeneratedDocuments,
    useEmployeeDocuments,
    useTemplate,
    generateDocument,
  };
};
