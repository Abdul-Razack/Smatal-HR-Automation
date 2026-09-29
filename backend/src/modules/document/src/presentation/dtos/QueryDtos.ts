import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/dto/PaginationQueryDto';

export class TemplateListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by Document Type ID' })
  @IsOptional()
  @IsString()
  documentTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Template Status (e.g. ACTIVE)',
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class DocumentListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by Document Type ID' })
  @IsOptional()
  @IsString()
  documentTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Generation Status (e.g. GENERATED)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by Employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Filter by Candidate ID' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: 'Filter by Workflow Instance ID' })
  @IsOptional()
  @IsString()
  workflowInstanceId?: string;

  @ApiPropertyOptional({ description: 'Filter documents created on or after this date (ISO string)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Filter documents created on or before this date (ISO string)' })
  @IsOptional()
  @IsString()
  endDate?: string;
}
