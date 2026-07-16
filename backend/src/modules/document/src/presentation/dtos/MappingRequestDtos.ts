import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportTemplateRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'The .docx template file',
  })
  file: any;

  @ApiProperty({
    description: 'The unique template ID to attach this version to',
  })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiPropertyOptional({ description: 'Optional notes for this version' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PlaceholderMappingDto {
  @ApiProperty({
    description: 'The exact placeholder key found in the document',
  })
  @IsString()
  @IsNotEmpty()
  placeholderKey: string;

  @ApiProperty({ description: 'The target Field Definition ID in the system' })
  @IsString()
  @IsNotEmpty()
  fieldDefinitionId: string;

  @ApiProperty({
    description:
      'Whether this placeholder must be provided to generate a document',
  })
  @IsBoolean()
  isRequired: boolean;

  @ApiPropertyOptional({ description: 'Display order in the UI' })
  @IsOptional()
  displayOrder?: number;
}

export class MapPlaceholdersRequestDto {
  @ApiProperty({
    type: [PlaceholderMappingDto],
    description: 'Array of placeholder mappings',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaceholderMappingDto)
  mappings: PlaceholderMappingDto[];
}
