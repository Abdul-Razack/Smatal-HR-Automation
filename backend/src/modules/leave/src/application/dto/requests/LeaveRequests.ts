import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { LeaveStatus } from '../../../domain/enums/LeaveEnums';

export class ApplyLeaveRequestDto {
  @ApiProperty({ description: 'ID of the employee applying for leave' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ description: 'ID of the leave type' })
  @IsUUID()
  leaveTypeId: string;

  @ApiProperty({ description: 'Start date of the leave' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date of the leave' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Reason for leave' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Optional attachment URL' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Total days of leave duration' })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  durationDays?: number;

  @ApiPropertyOptional({ description: 'Is half day leave?' })
  @IsOptional()
  @IsBoolean()
  isHalfDay?: boolean;
}

export class UpdateLeaveRequestDto {
  @ApiPropertyOptional({ description: 'Start date of the leave' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date of the leave' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Reason for leave' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Optional attachment URL' })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}

export class CancelLeaveRequestDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsString()
  reason: string;
}

export class ListLeavesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by employee ID' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Filter by leave type ID' })
  @IsOptional()
  @IsUUID()
  leaveTypeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by leave status',
    enum: LeaveStatus,
  })
  @IsOptional()
  @IsEnum(LeaveStatus)
  status?: LeaveStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({ description: 'Sort direction (asc/desc)' })
  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc';
}
