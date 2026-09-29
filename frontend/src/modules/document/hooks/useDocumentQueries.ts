import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DocumentApiService } from '../api/DocumentApiService';

export const documentKeys = {
  all: ['documents'] as const,
  templates: () => [...documentKeys.all, 'templates'] as const,
  templateList: (filters: any) => [...documentKeys.templates(), { filters }] as const,
  templateDetail: (id: string) => [...documentKeys.templates(), id] as const,
  
  generated: () => [...documentKeys.all, 'generated'] as const,
  generatedList: (filters: any) => [...documentKeys.generated(), { filters }] as const,
  generatedDetail: (id: string) => [...documentKeys.generated(), id] as const,
};

// --------------------------------------------------------
// TEMPLATE QUERIES
// --------------------------------------------------------

export function useTemplates(params: any) {
  return useQuery({
    queryKey: documentKeys.templateList(params),
    queryFn: () => DocumentApiService.getTemplates(params),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: documentKeys.templateDetail(id),
    queryFn: () => DocumentApiService.getTemplateById(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DocumentApiService.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.templates() });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DocumentApiService.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.templates() });
    },
  });
}

// --------------------------------------------------------
// VERSION QUERIES
// --------------------------------------------------------

export function useUploadTemplateVersion(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, notes }: { file: File; notes?: string }) => 
      DocumentApiService.uploadTemplateVersion(templateId, file, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.templateDetail(templateId) });
    },
  });
}

export function useSaveHtmlVersion(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, notes }: { content: string; notes?: string }) =>
      DocumentApiService.saveHtmlTemplateVersion(templateId, { content, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.templateDetail(templateId) });
    },
  });
}

export function usePreviewTemplate(templateId: string) {
  return useMutation({
    mutationFn: (data: {
      mode: 'SAMPLE' | 'LIVE';
      format?: 'HTML' | 'PDF';
      employeeId?: string;
      candidateId?: string;
    }) => DocumentApiService.previewTemplate(templateId, data),
  });
}

export function usePublishVersion(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => DocumentApiService.publishVersion(templateId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.templateDetail(templateId) });
    },
  });
}

export function useMapPlaceholders(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ versionId, mappings }: { versionId: string, mappings: any[] }) => 
      DocumentApiService.mapPlaceholders(templateId, versionId, mappings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.templateDetail(templateId) });
    },
  });
}

export function useDeleteTemplateVersion(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => DocumentApiService.deleteTemplateVersion(templateId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.templateDetail(templateId) });
    },
  });
}

// --------------------------------------------------------
// GENERATION QUERIES
// --------------------------------------------------------

export function useGenerateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DocumentApiService.generateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.generated() });
    },
  });
}

export function useGeneratedDocuments(params: any) {
  return useQuery({
    queryKey: documentKeys.generatedList(params),
    queryFn: () => DocumentApiService.getGeneratedDocuments(params),
  });
}

export function useGeneratedDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.generatedDetail(id),
    queryFn: () => DocumentApiService.getGeneratedDocumentById(id),
    enabled: !!id,
  });
}

export function useGlobalPlaceholders() {
  return useQuery({
    queryKey: ['globalPlaceholders'],
    queryFn: () => DocumentApiService.getGlobalPlaceholders(),
  });
}
