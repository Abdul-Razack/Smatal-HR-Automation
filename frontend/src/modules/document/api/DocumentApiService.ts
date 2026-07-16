import { apiClient } from '@/api/client';
import {
  TemplateDto,
  TemplateSummaryDto,
  GeneratedDocumentDto,
  GeneratedDocumentSummaryDto,
  DocumentPreviewDto,
  DocumentDownloadDto
} from '../types';

export class DocumentApiService {
  // --------------------------------------------------------
  // TEMPLATES
  // --------------------------------------------------------

  static async getTemplates(params?: { 
    page?: number; 
    pageSize?: number;
    companyId?: string;
    documentTypeId?: string;
    status?: string;
    search?: string;
  }): Promise<{ items: TemplateSummaryDto[], totalCount: number }> {
    const response = await apiClient.get(`/templates`, { params });
    // Assume PaginatedResult structure { isSuccess: true, data: { data: items, totalCount } }
    return response.data.data;
  }

  static async getTemplateById(id: string): Promise<TemplateDto> {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data.data;
  }

  static async createTemplate(data: {
    name: string;
    documentTypeId: string;
    description?: string;
  }): Promise<TemplateDto> {
    const response = await apiClient.post(`/templates`, data);
    return response.data.data;
  }

  static async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/templates/${id}`);
  }

  // --------------------------------------------------------
  // VERSIONS & UPLOADS
  // --------------------------------------------------------

  static async uploadTemplateVersion(templateId: string, file: File, notes?: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) formData.append('notes', notes);

    await apiClient.post(`/templates/${templateId}/versions/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  static async publishVersion(templateId: string, versionId: string): Promise<void> {
    await apiClient.post(`/templates/${templateId}/versions/${versionId}/publish`);
  }

  static async rollbackVersion(templateId: string, versionId: string): Promise<void> {
    await apiClient.post(`/templates/${templateId}/versions/${versionId}/rollback`);
  }

  static async mapPlaceholders(templateId: string, versionId: string, mappings: Array<{ placeholderKey: string, fieldDefinitionId: string }>): Promise<void> {
    await apiClient.post(`/templates/${templateId}/versions/${versionId}/map-placeholders`, { mappings });
  }

  // --------------------------------------------------------
  // GENERATION
  // --------------------------------------------------------

  static async generateDocument(data: {
    templateId: string;
    profileId: string;
    candidateId?: string;
    employeeId?: string;
    workflowInstanceId?: string;
    workflowStageId?: string;
  }): Promise<{ documentId: string, status: string }> {
    const response = await apiClient.post(`/documents/generate`, data);
    return response.data.data; // { documentId, status }
  }

  static async getGeneratedDocuments(params?: {
    page?: number;
    pageSize?: number;
    profileId?: string;
    templateId?: string;
    status?: string;
  }): Promise<{ items: GeneratedDocumentSummaryDto[], totalCount: number }> {
    const response = await apiClient.get(`/documents`, { params });
    return response.data.data;
  }

  static async getGeneratedDocumentById(id: string): Promise<GeneratedDocumentDto> {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data.data;
  }

  static async getDocumentPreview(id: string): Promise<DocumentPreviewDto> {
    const response = await apiClient.get(`/documents/${id}/preview`);
    return response.data.data;
  }

  static async getDocumentDownload(id: string, format: 'pdf' | 'docx'): Promise<DocumentDownloadDto> {
    const response = await apiClient.get(`/documents/${id}/download`, { params: { format } });
    return response.data.data;
  }
}
