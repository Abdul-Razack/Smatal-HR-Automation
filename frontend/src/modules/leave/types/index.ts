export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum LeaveDurationType {
  FULL_DAY = 'FULL_DAY',
  HALF_DAY = 'HALF_DAY',
}

export enum LeaveBalanceType {
  ACCRUED = 'ACCRUED',
  GRANTED = 'GRANTED',
}

export enum LeaveAccrualType {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum CarryForwardType {
  NONE = 'NONE',
  CAPPED = 'CAPPED',
  UNLIMITED = 'UNLIMITED',
}

export enum HolidayType {
  PUBLIC = 'PUBLIC',
  COMPANY = 'COMPANY',
  OPTIONAL = 'OPTIONAL',
}

export interface LeaveRequest {
  id: string;
  businessId: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  status: LeaveStatus;
  startDate: string | Date;
  endDate: string | Date;
  durationDays: number;
  isHalfDay: boolean;
  reason: string;
  attachmentUrl?: string | null;
  workflowInstanceId?: string | null;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export interface LeaveBalance {
  id: string;
  businessId: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  balanceType: LeaveBalanceType;
  totalEntitlement: number;
  accruedDays: number;
  carriedForward: number;
  usedDays: number;
  pendingDays: number;
  remainingBalance: number;
  availableBalance: number;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  updatedBy: string;
}

export interface LeaveType {
  id: string;
  businessId: string;
  companyId: string;
  name: string;
  code: string;
  description?: string | null;
  colorCode?: string | null;
  isPaid: boolean;
  isActive: boolean;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export interface LeavePolicy {
  id: string;
  businessId: string;
  companyId: string;
  leaveTypeId: string;
  name: string;
  description?: string | null;
  annualEntitlement: number;
  accrualType: LeaveAccrualType;
  carryForwardType: CarryForwardType;
  maxCarryForwardDays?: number | null;
  requiresAttachment: boolean;
  minDaysForAttachment?: number | null;
  isActive: boolean;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export interface Holiday {
  id: string;
  businessId: string;
  companyId: string;
  name: string;
  date: string | Date;
  type: HolidayType;
  description?: string | null;
  branchId?: string | null;
  isActive: boolean;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export interface ApplyLeaveRequestDto {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  durationType: LeaveDurationType;
  reason: string;
  attachmentUrl?: string;
}
