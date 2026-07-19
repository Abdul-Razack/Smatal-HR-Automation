import { ApiProperty } from '@nestjs/swagger';

export class PreviewRequestDto {
  @ApiProperty({ description: 'SAMPLE or LIVE', example: 'SAMPLE' })
  mode: 'SAMPLE' | 'LIVE';

  @ApiProperty({ description: 'HTML or PDF', example: 'HTML' })
  format: 'HTML' | 'PDF';

  @ApiProperty({ required: false })
  candidateId?: string;

  @ApiProperty({ required: false })
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
