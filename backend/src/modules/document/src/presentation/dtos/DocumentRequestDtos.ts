import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateDocumentRequestDto {
  @ApiProperty({ description: 'The unique template ID to generate from' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: 'The ID of the candidate or employee profile' })
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @ApiPropertyOptional({ description: 'The candidate ID, if applicable' })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiPropertyOptional({ description: 'The employee ID, if applicable' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'The workflow instance ID driving this generation',
  })
  @IsOptional()
  @IsString()
  workflowInstanceId?: string;

  @ApiPropertyOptional({
    description: 'The workflow stage ID driving this generation',
  })
  @IsOptional()
  @IsString()
  workflowStageId?: string;
}
