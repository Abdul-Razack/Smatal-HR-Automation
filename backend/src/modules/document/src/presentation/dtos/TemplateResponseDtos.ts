import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TemplateStatus,
  TemplateVersionStatus,
  TemplateImportStatus,
} from '../../domain/enums/DocumentEnums';

export class PlaceholderDto {
  @ApiProperty({
    description: 'The exact placeholder key found in the document',
  })
  placeholderKey: string;

  @ApiPropertyOptional({ description: 'The mapped Field Definition ID' })
  fieldDefinitionId?: string;

  @ApiProperty({
    description: 'Whether this placeholder is required for generation',
  })
  isRequired: boolean;
}

export class TemplateVersionDto {
  @ApiProperty({ description: 'Unique identifier of the version' })
  id: string;

  @ApiProperty({ description: 'Version number (1, 2, 3...)' })
  versionNumber: number;

  @ApiProperty({
    description: 'Status of this version',
    enum: TemplateVersionStatus,
  })
  status: TemplateVersionStatus;

  @ApiProperty({ description: 'MIME content type (e.g., html or docx)' })
  contentType: string;

  @ApiPropertyOptional({ description: 'Notes associated with this version' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Import status for DOCX templates',
    enum: TemplateImportStatus,
  })
  importStatus?: TemplateImportStatus;

  @ApiPropertyOptional({ description: 'Original filename for DOCX imports' })
  originalFilename?: string;

  @ApiPropertyOptional({ description: 'Array of detected placeholders' })
  placeholders?: PlaceholderDto[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
}

export class TemplateSummaryDto {
  @ApiProperty({ description: 'Unique identifier of the template' })
  id: string;

  @ApiProperty({ description: 'Business ID (e.g., TPL-1001)' })
  businessId: string;

  @ApiProperty({ description: 'Display name of the template' })
  name: string;

  @ApiProperty({
    description: 'Current status of the template',
    enum: TemplateStatus,
  })
  status: TemplateStatus;

  @ApiProperty({ description: 'Number of versions available' })
  versionCount: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class TemplateDto {
  @ApiProperty({ description: 'Unique identifier of the template' })
  id: string;

  @ApiProperty({ description: 'Business ID (e.g., TPL-1001)' })
  businessId: string;

  @ApiProperty({ description: 'ID of the associated Document Type' })
  documentTypeId: string;

  @ApiProperty({ description: 'Display name of the template' })
  name: string;

  @ApiPropertyOptional({ description: 'Description of the template' })
  description?: string;

  @ApiProperty({
    description: 'Current status of the template',
    enum: TemplateStatus,
  })
  status: TemplateStatus;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiPropertyOptional({
    type: [TemplateVersionDto],
    description: 'List of all versions',
  })
  versions?: TemplateVersionDto[];
}
