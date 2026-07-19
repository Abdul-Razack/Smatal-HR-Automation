export type TemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TemplateVersionStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED' | 'ARCHIVED' | 'ROLLED_BACK';
export type TemplateImportStatus = 'PENDING' | 'SCANNING' | 'SCANNED' | 'MAPPING_REQUIRED' | 'MAPPED' | 'FAILED';

export type DocumentGenerationStatus = 
  | 'PENDING' | 'DRAFT' | 'GENERATING' | 'GENERATED' 
  | 'REVIEWED' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'SIGNED' 
  | 'ARCHIVED' | 'VOIDED' | 'FAILED';

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
  notes?: string;
  importStatus?: TemplateImportStatus;
  originalFilename?: string;
  placeholders?: PlaceholderDto[];
  createdAt: string;
}

export interface TemplateSummaryDto {
  id: string;
  businessId: string;
  name: string;
  status: TemplateStatus;
  versionCount: number;
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
  workflowInstanceId?: string;
  workflowStageId?: string;
  candidateId?: string;
  employeeId?: string;
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
