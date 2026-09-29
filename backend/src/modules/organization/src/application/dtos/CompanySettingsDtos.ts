import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateCompanySettingsDto {
  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Company name cannot be empty when provided.' })
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Company legal / registered name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @ApiPropertyOptional({ description: 'Company official website' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i, {
    message: 'Website must be a valid URL format (e.g. https://example.com)',
  })
  website?: string;

  @ApiPropertyOptional({ description: 'Company registered address' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'Company official phone' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/, {
    message: 'Phone number must be a valid telephone format',
  })
  phone?: string;

  @ApiPropertyOptional({ description: 'Company official email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'Industry or business category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Authorized person signatory name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorizedPerson?: string;

  @ApiPropertyOptional({ description: 'Authorized person designation / title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  authorizedPersonDesignation?: string;

  @ApiPropertyOptional({ description: 'Company logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Authorized signatory signature URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  signatureUrl?: string;
}

export class CompanySettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  businessId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  legalName?: string | null;

  @ApiProperty()
  code: string;

  @ApiPropertyOptional()
  website?: string | null;

  @ApiPropertyOptional()
  address?: string | null;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  industry?: string | null;

  @ApiPropertyOptional()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  authorizedPerson?: string | null;

  @ApiPropertyOptional()
  authorizedPersonDesignation?: string | null;

  @ApiPropertyOptional()
  signatureUrl?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  updatedAt: Date;
}
