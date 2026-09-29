import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentGenerationStatus } from '../../domain/enums/DocumentEnums';

export class DocumentSnapshotDto {
  @ApiProperty({
    description: 'The absolute URL or storage URI of the generated file',
  })
  fileUrl: string;

  @ApiProperty({ description: 'The MIME content type (e.g., application/pdf)' })
  mimeType: string;

  @ApiPropertyOptional({ description: 'The file size in bytes' })
  fileSize?: number;

  @ApiPropertyOptional({
    description: 'The file checksum for integrity verification',
  })
  checksum?: string;

  @ApiProperty({ description: 'When this snapshot was created' })
  createdAt: Date;
}

export class GeneratedDocumentDto {
  @ApiProperty({ description: 'Unique identifier of the generated document' })
  id: string;

  @ApiProperty({ description: 'Business ID (e.g., GDOC-2023-0001)' })
  businessId: string;

  @ApiProperty({ description: 'The candidate or employee profile ID' })
  profileId: string;

  @ApiProperty({ description: 'The ID of the document type' })
  documentTypeId: string;

  @ApiProperty({
    description: 'The status of generation',
    enum: DocumentGenerationStatus,
  })
  status: DocumentGenerationStatus;

  @ApiPropertyOptional({
    description: 'The ID of the workflow instance that triggered this',
  })
  workflowInstanceId?: string;

  @ApiPropertyOptional({
    description: 'The ID of the workflow stage that triggered this',
  })
  workflowStageId?: string;

  @ApiProperty({ description: 'The entity type (e.g. CANDIDATE, EMPLOYEE)' })
  entityType: string;

  @ApiProperty({ description: 'The entity ID' })
  entityId: string;

  @ApiPropertyOptional({ description: 'Company ID' })
  companyId?: string;

  @ApiPropertyOptional({ description: 'Template Version ID' })
  templateVersionId?: string;

  @ApiPropertyOptional({ description: 'Template ID' })
  templateId?: string;

  @ApiPropertyOptional({ description: 'Timestamp when document was generated' })
  generatedAt?: Date;

  @ApiPropertyOptional({ description: 'User or system that generated the document' })
  generatedBy?: string;

  // Provenance fields
  @ApiPropertyOptional({ description: 'Human-readable document type name' })
  documentTypeName?: string;

  @ApiPropertyOptional({ description: 'Document type code' })
  documentTypeCode?: string;

  @ApiPropertyOptional({ description: 'Template name' })
  templateName?: string;

  @ApiPropertyOptional({ description: 'Template version number (e.g. 1 for v1)' })
  templateVersionNumber?: number;

  @ApiPropertyOptional({ description: 'Employee full name' })
  employeeName?: string;

  @ApiPropertyOptional({ description: 'Employee code or number' })
  employeeNumber?: string;

  @ApiPropertyOptional({ description: 'Company legal or trade name' })
  companyName?: string;

  @ApiPropertyOptional({
    type: [DocumentSnapshotDto],
    description: 'List of generated files (e.g., DOCX and PDF versions)',
  })
  snapshots?: DocumentSnapshotDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class GeneratedDocumentSummaryDto {
  @ApiProperty({ description: 'Unique identifier of the generated document' })
  id: string;

  @ApiProperty({ description: 'Business ID (e.g., GDOC-2023-0001)' })
  businessId: string;

  @ApiProperty({ description: 'The candidate or employee profile ID' })
  profileId: string;

  @ApiProperty({
    description: 'The status of generation',
    enum: DocumentGenerationStatus,
  })
  status: DocumentGenerationStatus;

  @ApiProperty({ description: 'Number of snapshots available' })
  snapshotCount: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class DocumentPreviewDto {
  @ApiProperty({ description: 'The URL to load the preview in the browser' })
  previewUrl: string;

  @ApiProperty({ description: 'The MIME type of the preview file' })
  mimeType: string;
}

export class DocumentDownloadDto {
  @ApiProperty({ description: 'The securely signed download URL' })
  downloadUrl: string;

  @ApiProperty({ description: 'The filename for the download' })
  filename: string;

  @ApiProperty({ description: 'The MIME type' })
  mimeType: string;
}
