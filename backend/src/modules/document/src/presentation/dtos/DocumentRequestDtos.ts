import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateDocumentRequestDto {

  @ApiProperty({ description: 'The document type ID to generate' })
  @IsString()
  @IsNotEmpty()
  documentTypeId: string;

  @ApiProperty({ description: 'The entity type (e.g. CANDIDATE, EMPLOYEE)' })
  @IsString()
  @IsNotEmpty()
  entityType: string;

  @ApiProperty({ description: 'The entity ID' })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiPropertyOptional({
    description: 'The specific template ID to generate from (optional, auto-routes to branch template if omitted)',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'The workflow instance ID driving this generation',
  })
  @IsOptional()
  @IsString()
  workflowInstanceId?: string;
}
