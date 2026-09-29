import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsNumber,
  Min,
  IsEnum,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmployeeStatus } from '../../../domain/enums/EmployeeStatus';

export class DynamicFieldUpdateRequest {
  @ApiProperty()
  @IsUUID()
  fieldDefinitionId: string;

  @ApiProperty()
  value: any;
}

export class CreateEmployeeRequest {
  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Personal email address', example: 'john.doe@example.com' })
  @IsEmail()
  personalEmail: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Residential address', example: '123 Main St, Springfield' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD)', example: '1990-05-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'Male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Designation ID' })
  @IsOptional()
  @IsUUID()
  designationId?: string;

  @ApiPropertyOptional({ description: 'Branch ID' })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Reports to Manager Employee ID' })
  @IsOptional()
  @IsUUID()
  reportsToId?: string;

  @ApiPropertyOptional({ description: 'Company Employee Number/Code', example: 'EMP-001' })
  @IsOptional()
  @IsString()
  employeeNumber?: string;

  @ApiPropertyOptional({
    description: 'Employment type',
    example: 'Full-time',
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
  })
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional({ description: 'Salary', example: 75000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiProperty({ description: 'Joining date (YYYY-MM-DD)', example: '2025-01-15' })
  @IsDateString()
  joinedDate: string;

  @ApiPropertyOptional({
    description: 'Employment status',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Probation end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  probationEndDate?: string;

  @ApiPropertyOptional({ type: [DynamicFieldUpdateRequest] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DynamicFieldUpdateRequest)
  dynamicFields?: DynamicFieldUpdateRequest[];
}

export class UpdateEmployeeRequest {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Personal email address' })
  @IsOptional()
  @IsEmail()
  personalEmail?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Residential address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsString()
  gender?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employmentType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinedDate?: string;

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

export class TransitionLifecycleRequest {
  @ApiProperty({
    enum: EmployeeStatus,
    description: 'Target lifecycle status',
    example: EmployeeStatus.CONFIRMED,
  })
  @IsEnum(EmployeeStatus)
  status: EmployeeStatus;

  @ApiPropertyOptional({ description: 'Effective date of transition (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Probation end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  probationEndDate?: string;

  @ApiPropertyOptional({ description: 'Confirmation date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  confirmationDate?: string;

  @ApiPropertyOptional({ description: 'Resignation date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  resignationDate?: string;

  @ApiPropertyOptional({ description: 'Last working date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  lastWorkingDate?: string;

  @ApiPropertyOptional({ description: 'Notice period in days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  noticePeriodDays?: number;

  @ApiPropertyOptional({ description: 'Reason or notes for lifecycle transition' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SubmitResignationRequest {
  @ApiProperty({ description: 'Resignation date (YYYY-MM-DD)', example: '2026-10-01' })
  @IsDateString()
  resignationDate: string;

  @ApiProperty({ description: 'Reason for resignation', example: 'Pursuing higher education' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Notice period in days', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(0)
  noticePeriodDays?: number;

  @ApiPropertyOptional({ description: 'Requested last working date (YYYY-MM-DD)', example: '2026-10-31' })
  @IsOptional()
  @IsDateString()
  lastWorkingDate?: string;
}

export class UpdateResignationRequest {
  @ApiPropertyOptional({ description: 'Updated reason for resignation' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Updated notice period in days' })
  @IsOptional()
  @IsInt()
  @Min(0)
  noticePeriodDays?: number;

  @ApiPropertyOptional({ description: 'Updated requested last working date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  lastWorkingDate?: string;
}

export class AcceptResignationRequest {
  @ApiPropertyOptional({ description: 'HR / Manager comments on acceptance', example: 'Approved as per company policy.' })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiPropertyOptional({ description: 'Final agreed last working date (YYYY-MM-DD)', example: '2026-10-31' })
  @IsOptional()
  @IsDateString()
  lastWorkingDate?: string;
}

export class WithdrawResignationRequest {
  @ApiPropertyOptional({ description: 'Reason for withdrawing resignation', example: 'Retaining role after manager discussion' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateClearanceRequest {
  @ApiProperty({
    description: 'Clearance status',
    enum: ['PENDING', 'CLEARED', 'NOT_APPLICABLE'],
    example: 'CLEARED',
  })
  @IsEnum(['PENDING', 'CLEARED', 'NOT_APPLICABLE'])
  status: 'PENDING' | 'CLEARED' | 'NOT_APPLICABLE';

  @ApiPropertyOptional({ description: 'Remarks or handover verification notes', example: 'All IT assets and laptops returned.' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CompleteExitRequest {
  @ApiPropertyOptional({ description: 'Final confirmed last working date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  lastWorkingDate?: string;

  @ApiPropertyOptional({ description: 'Final exit handover notes or remarks' })
  @IsOptional()
  @IsString()
  notes?: string;
}


