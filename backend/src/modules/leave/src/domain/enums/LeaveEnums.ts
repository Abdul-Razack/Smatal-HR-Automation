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
