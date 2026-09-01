import { apiClient } from '@/api/client';
import { GeneratedDocumentDto, TemplateDto } from '../types';

export const documentApi = {
  // Generated Documents
  generateDocument: async (data: {
    documentTypeId: string;
    entityType: string;
    entityId: string;
    workflowInstanceId?: string;
  }): Promise<{ id: string }> => {
    const response = await apiClient.post('/generated-documents/generate', data);
    return response.data;
  },

  getGeneratedDocument: async (id: string): Promise<GeneratedDocumentDto> => {
    const response = await apiClient.get(`/generated-documents/${id}`);
    return response.data;
  },

  getAllGeneratedDocuments: async (filters?: {
    entityType?: string;
    entityId?: string;
  }): Promise<GeneratedDocumentDto[]> => {
    const params = new URLSearchParams();
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.entityId) params.append('entityId', filters.entityId);
    
    const response = await apiClient.get(`/generated-documents?${params.toString()}`);
    return response.data;
  },

  // Templates
  createTemplate: async (data: { documentTypeId: string; name: string; description?: string }): Promise<{ id: string }> => {
    const response = await apiClient.post('/templates', data);
    return response.data;
  },

  createTemplateVersion: async (id: string, data: { content: string; contentType?: string; placeholders?: string[]; notes?: string }): Promise<{ id: string }> => {
    const response = await apiClient.post(`/templates/${id}/versions`, data);
    return response.data;
  },

  publishTemplateVersion: async (id: string, versionId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/templates/${id}/versions/${versionId}/publish`);
    return response.data;
  },

  getTemplate: async (id: string): Promise<TemplateDto> => {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data;
  },
};
