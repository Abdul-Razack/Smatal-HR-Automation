import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class PreviewRequestDto {
  @ApiProperty({ description: 'SAMPLE or LIVE', example: 'SAMPLE' })
  @IsIn(['SAMPLE', 'LIVE'])
  mode: 'SAMPLE' | 'LIVE';

  @ApiProperty({ description: 'HTML or PDF', example: 'HTML' })
  @IsIn(['HTML', 'PDF'])
  format: 'HTML' | 'PDF';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  candidateId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class PreviewResponseDto {
  @ApiProperty({ required: false, description: 'The rendered HTML content' })
  html?: string;

  @ApiProperty({ required: false, description: 'The rendered PDF buffer' })
  pdfBuffer?: Buffer;

  @ApiProperty({ type: [String], description: 'List of successfully resolved placeholder keys' })
  resolvedKeys: string[];

  @ApiProperty({ type: [String], description: 'List of unresolved placeholder keys' })
  unresolvedKeys: string[];

  @ApiProperty({ type: [String], description: 'List of validation errors (e.g. unknown keys, missing required values)' })
  errors: string[];

  @ApiProperty({ type: [String], description: 'List of warnings (e.g. missing optional values)' })
  warnings: string[];
}
