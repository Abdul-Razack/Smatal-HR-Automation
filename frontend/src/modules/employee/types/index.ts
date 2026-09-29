export type EmployeeStatus = 
  | 'OFFER'
  | 'JOINED'
  | 'PROBATION'
  | 'CONFIRMED'
  | 'NOTICE_PERIOD'
  | 'RELIEVED'
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'NOTICE'
  | 'TERMINATED'
  | 'RESIGNED'
  | 'RETIRED';

export interface EmployeeProfile {
  id?: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  profilePhoto?: string | null;
}

export interface Employee {
  id: string;
  businessId: string;
  companyId: string;
  profileId: string;
  employeeNumber?: string | null;
  employmentType?: string | null;
  salary?: number | null;
  status: EmployeeStatus;
  joinedDate: string;
  confirmationDate?: string | null;
  probationEndDate?: string | null;
  resignationDate?: string | null;
  lastWorkingDate?: string | null;
  noticePeriodDays?: number | null;
  resignationReason?: string | null;
  resignationStatus?: ResignationStatusType | null;
  terminationDate?: string | null;
  terminationReason?: string | null;
  
  // Organization Mapping IDs
  departmentId?: string | null;
  designationId?: string | null;
  branchId?: string | null;
  reportsToId?: string | null;

  // Resolved entities
  department?: { id: string; name: string } | null;
  designation?: { id: string; name: string } | null;
  branch?: { id: string; name: string } | null;
  manager?: { id: string; employeeNumber?: string | null; name: string } | null;

  profile?: EmployeeProfile;
  dynamicFields?: { fieldDefinitionId: string; value: any; key?: string; label?: string }[];
}

export type ResignationStatusType =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'WITHDRAWN'
  | 'COMPLETED';

export type ClearanceDepartmentType =
  | 'HR'
  | 'FINANCE'
  | 'IT'
  | 'ADMINISTRATION';

export type ClearanceStatusType =
  | 'PENDING'
  | 'CLEARED'
  | 'NOT_APPLICABLE';

export interface ExitClearanceItem {
  id?: string;
  department: ClearanceDepartmentType;
  status: ClearanceStatusType;
  remarks?: string | null;
  clearedBy?: string | null;
  clearedAt?: string | null;
}

export interface ResignationDetails {
  currentStatus: ResignationStatusType;
  resignationDate?: string | null;
  lastWorkingDate?: string | null;
  noticePeriodDays?: number | null;
  reason?: string | null;
  acceptedBy?: string | null;
  acceptedAt?: string | null;
  history: Array<{
    id: string;
    status: ResignationStatusType;
    resignationDate: string;
    lastWorkingDate?: string | null;
    reason: string;
    acceptedBy?: string | null;
    acceptedAt?: string | null;
    rejectionReason?: string | null;
    createdAt: string;
  }>;
}

export interface ExitOverviewData {
  pendingResignations: number;
  activeNoticePeriods: number;
  completedExits: number;
  pipeline: Array<{
    id: string;
    employeeNumber: string;
    name: string;
    department: string;
    designation: string;
    resignationStatus: ResignationStatusType;
    lifecycleStatus: EmployeeStatus;
    resignationDate: string | null;
    lastWorkingDate: string | null;
    clearanceProgress: {
      cleared: number;
      total: number;
      isAllCleared: boolean;
    };
  }>;
}

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  personalEmail: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  departmentId?: string;
  designationId?: string;
  branchId?: string;
  reportsToId?: string;
  employeeNumber?: string;
  employmentType?: string;
  salary?: number;
  joinedDate: string;
  status?: EmployeeStatus;
  probationEndDate?: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  departmentId?: string;
  designationId?: string;
  branchId?: string;
  reportsToId?: string;
  employeeNumber?: string;
  employmentType?: string;
  salary?: number;
  joinedDate?: string;
  dynamicFields?: { fieldDefinitionId: string; value: any }[];
}

export interface TransitionLifecycleInput {
  status: EmployeeStatus;
  effectiveDate?: string;
  probationEndDate?: string;
  confirmationDate?: string;
  resignationDate?: string;
  lastWorkingDate?: string;
  noticePeriodDays?: number;
  notes?: string;
}

