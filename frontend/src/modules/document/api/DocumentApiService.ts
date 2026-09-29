import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types';
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
    formData.append('templateId', templateId);
    if (notes) formData.append('notes', notes);

    await apiClient.post(`/templates/import`, formData, {
      headers: { 'Content-Type': undefined }
    });
  }

  static async saveHtmlTemplateVersion(
    templateId: string,
    data: { content: string; notes?: string }
  ): Promise<{ versionId: string; versionNumber: number; detectedPlaceholders: string[] }> {
    const response = await apiClient.post(`/templates/${templateId}/versions/html`, data);
    return response.data.data;
  }

  static async previewTemplate(
    templateId: string,
    data: {
      mode: 'SAMPLE' | 'LIVE';
      format?: 'HTML' | 'PDF';
      employeeId?: string;
      candidateId?: string;
    }
  ): Promise<any> {
    const response = await apiClient.post(`/templates/${templateId}/preview`, data);
    return response.data.data;
  }

  static async getGlobalPlaceholders(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/templates/placeholders`);
    return response.data.data || [];
  }

  static async publishVersion(templateId: string, versionId: string): Promise<void> {
    await apiClient.post(`/templates/${templateId}/versions/${versionId}/publish`);
  }

  static async rollbackVersion(templateId: string, versionId: string): Promise<void> {
    await apiClient.post(`/templates/${templateId}/versions/${versionId}/rollback`);
  }

  static async mapPlaceholders(templateId: string, versionId: string, mappings: Array<{ placeholderKey: string, fieldDefinitionId: string, isRequired?: boolean }>): Promise<void> {
    const formattedMappings = mappings.map(m => ({
      ...m,
      isRequired: m.isRequired ?? true
    }));
    await apiClient.post(`/templates/${templateId}/versions/${versionId}/map-placeholders`, { mappings: formattedMappings });
  }

  static async deleteTemplateVersion(templateId: string, versionId: string): Promise<void> {
    await apiClient.delete(`/templates/${templateId}/versions/${versionId}`);
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

  static async downloadDocumentFile(id: string, format: 'pdf' | 'docx' = 'pdf', customFilename?: string): Promise<void> {
    const response = await apiClient.get(`/documents/${id}/download`, {
      params: { format },
      responseType: 'blob',
    });

    let filename = customFilename || `document_${id}.${format}`;
    const disposition = response.headers?.['content-disposition'];
    if (disposition) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blobUrl = window.URL.createObjectURL(
      new Blob([response.data], {
        type: String(response.headers?.['content-type'] || 'application/pdf'),
      }),
    );
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  }

  static async getDocumentPreviewBlob(id: string, format: 'pdf' | 'html' = 'pdf'): Promise<Blob> {
    const response = await apiClient.get(`/documents/${id}/preview`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }
}
