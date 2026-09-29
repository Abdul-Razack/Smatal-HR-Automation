import { apiClient } from '@/api/client';
import {
  GeneratedDocumentDto,
  TemplateDto,
  DocumentTypeDto,
  CreateDocumentTypeInput,
  UpdateDocumentTypeInput,
} from '../types';

export const documentApi = {
  // Document Types
  listDocumentTypes: async (params?: {
    search?: string;
    isActive?: boolean;
  }): Promise<DocumentTypeDto[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    const response = await apiClient.get(`/document-types?${query.toString()}`);
    return response.data;
  },

  getDocumentType: async (id: string): Promise<DocumentTypeDto> => {
    const response = await apiClient.get(`/document-types/${id}`);
    return response.data;
  },

  createDocumentType: async (data: CreateDocumentTypeInput): Promise<{ id: string }> => {
    const response = await apiClient.post('/document-types', data);
    return response.data;
  },

  updateDocumentType: async (
    id: string,
    data: UpdateDocumentTypeInput,
  ): Promise<{ success: boolean }> => {
    const response = await apiClient.patch(`/document-types/${id}`, data);
    return response.data;
  },

  updateDocumentTypeStatus: async (
    id: string,
    isActive: boolean,
  ): Promise<{ success: boolean; isActive: boolean }> => {
    const response = await apiClient.patch(`/document-types/${id}/status`, { isActive });
    return response.data;
  },
  // Generated Documents
  generateDocument: async (data: {
    documentTypeId: string;
    entityType: string;
    entityId: string;
    workflowInstanceId?: string;
  }): Promise<{ id: string }> => {
    const response = await apiClient.post<any>('/generated-documents/generate', data);
    let target = response.data;
    while (target && typeof target === 'object' && target.data && !target.id) {
      target = target.data;
    }
    const id = target?.id || target?.data?.id;
    return { id: String(id) };
  },

  getGeneratedDocument: async (id: string): Promise<GeneratedDocumentDto> => {
    const response = await apiClient.get(`/generated-documents/${id}`);
    return response.data;
  },

  getAllGeneratedDocuments: async (filters?: {
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
  }): Promise<GeneratedDocumentDto[]> => {
    const params = new URLSearchParams();
    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.entityId) params.append('entityId', filters.entityId);
    if (filters?.employeeId) params.append('employeeId', filters.employeeId);
    if (filters?.candidateId) params.append('candidateId', filters.candidateId);
    if (filters?.documentTypeId) params.append('documentTypeId', filters.documentTypeId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));
    
    const response = await apiClient.get(`/generated-documents?${params.toString()}`);
    const res = response.data;
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.items && Array.isArray(res.data.items)) return res.data.items;
    if (res?.items && Array.isArray(res.items)) return res.items;
    return [];
  },

  getEmployeeDocuments: async (employeeId: string): Promise<GeneratedDocumentDto[]> => {
    const response = await apiClient.get(`/employees/${employeeId}/documents`);
    const res = response.data;
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    if (res?.data?.items && Array.isArray(res.data.items)) return res.data.items;
    if (res?.items && Array.isArray(res.items)) return res.items;
    return [];
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
