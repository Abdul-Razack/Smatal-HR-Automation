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

  @ApiPropertyOptional({ description: 'The candidate ID, if applicable' })
  candidateId?: string;

  @ApiPropertyOptional({ description: 'The employee ID, if applicable' })
  employeeId?: string;

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
