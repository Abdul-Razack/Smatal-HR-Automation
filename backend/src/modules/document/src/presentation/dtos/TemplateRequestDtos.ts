import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateRequestDto {
  @ApiProperty({ description: 'The unique business ID of the document type' })
  @IsString()
  @IsNotEmpty()
  documentTypeId: string;

  @ApiProperty({ description: 'The display name of the template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Optional description of the template' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePlaceholderDto {
  @ApiProperty()
  @IsString()
  fieldDefinitionId: string;

  @ApiProperty()
  @IsString()
  placeholderKey: string;

  @ApiProperty()
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty()
  @IsNumber()
  displayOrder: number;
}

export class CreateTemplateVersionRequestDto {
  @ApiProperty({ description: 'The HTML string content for the version' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'MIME content type', default: 'html' })
  @IsOptional()
  @IsString()
  contentType?: string = 'html';

  @ApiPropertyOptional({
    type: [CreatePlaceholderDto],
    description: 'Array of detected placeholders',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlaceholderDto)
  placeholders?: CreatePlaceholderDto[];

  @ApiPropertyOptional({ description: 'Version notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
