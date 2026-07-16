import { IsOptional, IsUUID, IsDateString, IsString } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class DynamicFieldUpdateRequest {
  @ApiProperty()
  @IsUUID()
  fieldDefinitionId: string;

  @ApiProperty()
  value: any;
}

export class UpdateEmployeeRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  designationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reportsToId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional({ type: [DynamicFieldUpdateRequest] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DynamicFieldUpdateRequest)
  dynamicFields?: DynamicFieldUpdateRequest[];
}

export class TerminateEmployeeRequest {
  @ApiProperty()
  @IsDateString()
  terminationDate: string;

  @ApiProperty()
  @IsString()
  reason: string;
}
