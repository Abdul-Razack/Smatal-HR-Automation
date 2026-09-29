export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TemplateVersionStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED' | 'ROLLED_BACK';
export type TemplateImportStatus = 'PENDING' | 'SCANNING' | 'SCANNED' | 'MAPPING_REQUIRED' | 'MAPPED' | 'FAILED';

export type DocumentGenerationStatus = 
  | 'PENDING' | 'DRAFT' | 'GENERATING' | 'GENERATED' 
  | 'REVIEWED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'SIGNED' 
  | 'ARCHIVED' | 'VOIDED' | 'FAILED';

export interface DocumentTypeDto {
  id: string;
  businessId: string;
  companyId: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  generatedDocumentsCount?: number;
  templatesCount?: number;
}

export interface CreateDocumentTypeInput {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDocumentTypeInput {
  name: string;
  description?: string | null;
}

export interface PlaceholderDto {
  placeholderKey: string;
  fieldDefinitionId?: string;
  isRequired: boolean;
}

export interface TemplateVersionDto {
  id: string;
  versionNumber: number;
  status: TemplateVersionStatus;
  contentType: string;
  content?: string;
  notes?: string;
  importStatus?: TemplateImportStatus;
  originalFilename?: string;
  placeholders?: PlaceholderDto[];
  createdAt: string;
}

export interface PreviewResponseDto {
  html?: string;
  pdfBuffer?: any;
  contentBase64?: string;
  mimeType?: string;
  resolvedKeys: string[];
  unresolvedKeys: string[];
  errors: string[];
  warnings: string[];
}

export interface TemplateSummaryDto {
  id: string;
  businessId: string;
  name: string;
  status: TemplateStatus;
  versionCount: number;
  documentTypeId?: string;
  documentTypeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDto {
  id: string;
  businessId: string;
  documentTypeId: string;
  name: string;
  description?: string;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
  versions?: TemplateVersionDto[];
}

export interface DocumentSnapshotDto {
  fileUrl: string;
  mimeType: string;
  fileSize?: number;
  checksum?: string;
  createdAt: string;
}

export interface GeneratedDocumentDto {
  id: string;
  businessId: string;
  profileId: string;
  documentTypeId: string;
  status: DocumentGenerationStatus;
  templateId?: string;
  templateVersionId?: string;
  generatedBy?: string;
  generatedAt?: string;
  companyId?: string;
  companyName?: string;
  documentTypeName?: string;
  documentTypeCode?: string;
  templateName?: string;
  templateVersionNumber?: number;
  employeeName?: string;
  employeeNumber?: string;
  workflowInstanceId?: string;
  workflowStageId?: string;
  entityType: string;
  entityId: string;
  snapshots?: DocumentSnapshotDto[];
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedDocumentSummaryDto {
  id: string;
  businessId: string;
  profileId: string;
  status: DocumentGenerationStatus;
  snapshotCount: number;
  createdAt: string;
}

export interface DocumentPreviewDto {
  previewUrl: string;
  mimeType: string;
}

export interface DocumentDownloadDto {
  downloadUrl: string;
  filename: string;
  mimeType: string;
}
