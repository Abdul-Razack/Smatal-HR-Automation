import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LeaveStatus,
  LeaveBalanceType,
  LeaveAccrualType,
  CarryForwardType,
  HolidayType,
} from '../../../domain/enums/LeaveEnums';

export class LeaveResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() businessId: string;
  @ApiProperty() companyId: string;
  @ApiProperty() employeeId: string;
  @ApiProperty() leaveTypeId: string;
  @ApiProperty({ enum: LeaveStatus }) status: LeaveStatus;
  @ApiProperty() startDate: Date;
  @ApiProperty() endDate: Date;
  @ApiProperty() durationDays: number;
  @ApiProperty() isHalfDay: boolean;
  @ApiProperty() reason: string;
  @ApiPropertyOptional() attachmentUrl?: string | null;
  @ApiPropertyOptional() workflowInstanceId?: string | null;
  @ApiProperty() version: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: string;
  @ApiProperty() updatedBy: string;
  @ApiProperty() isDeleted: boolean;
}

export class LeaveBalanceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() businessId: string;
  @ApiProperty() companyId: string;
  @ApiProperty() employeeId: string;
  @ApiProperty() leaveTypeId: string;
  @ApiProperty() year: number;
  @ApiProperty({ enum: LeaveBalanceType }) balanceType: LeaveBalanceType;
  @ApiProperty() totalEntitlement: number;
  @ApiProperty() accruedDays: number;
  @ApiProperty() carriedForward: number;
  @ApiProperty() usedDays: number;
  @ApiProperty() pendingDays: number;
  @ApiProperty() remainingBalance: number;
  @ApiProperty() availableBalance: number;
  @ApiProperty() version: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: string;
  @ApiProperty() updatedBy: string;
}

export class LeaveTypeResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() businessId: string;
  @ApiProperty() companyId: string;
  @ApiProperty() name: string;
  @ApiProperty() code: string;
  @ApiPropertyOptional() description: string | null;
  @ApiPropertyOptional() colorCode: string | null;
  @ApiProperty() isPaid: boolean;
  @ApiProperty() isActive: boolean;
  @ApiProperty() version: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: string;
  @ApiProperty() updatedBy: string;
  @ApiProperty() isDeleted: boolean;
}

export class LeavePolicyResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() businessId: string;
  @ApiProperty() companyId: string;
  @ApiProperty() leaveTypeId: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty() annualEntitlement: number;
  @ApiProperty({ enum: LeaveAccrualType }) accrualType: LeaveAccrualType;
  @ApiProperty({ enum: CarryForwardType }) carryForwardType: CarryForwardType;
  @ApiPropertyOptional() maxCarryForwardDays: number | null;
  @ApiProperty() requiresAttachment: boolean;
  @ApiPropertyOptional() minDaysForAttachment: number | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() version: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: string;
  @ApiProperty() updatedBy: string;
  @ApiProperty() isDeleted: boolean;
}

export class HolidayResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() businessId: string;
  @ApiProperty() companyId: string;
  @ApiProperty() name: string;
  @ApiProperty() date: Date;
  @ApiProperty({ enum: HolidayType }) type: HolidayType;
  @ApiPropertyOptional() description: string | null;
  @ApiPropertyOptional() branchId: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() version: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() createdBy: string;
  @ApiProperty() updatedBy: string;
  @ApiProperty() isDeleted: boolean;
}
