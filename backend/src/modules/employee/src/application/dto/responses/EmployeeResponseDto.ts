import { EmployeeStatus } from '../../../domain/enums/EmployeeStatus';

export class EmployeeResponseDto {
  id: string;
  businessId: string;
  companyId: string;
  profileId: string;
  status: EmployeeStatus;
  joinedDate: Date;
  departmentId?: string | null;
  designationId?: string | null;
  branchId?: string | null;
  reportsToId?: string | null;
  employeeNumber?: string | null;
  employmentType?: string | null;
  salary?: number | null;
  confirmationDate?: Date | null;
  probationEndDate?: Date | null;
  resignationDate?: Date | null;
  lastWorkingDate?: Date | null;
  noticePeriodDays?: number | null;
  resignationReason?: string | null;
  resignationStatus?: string | null;
  terminationDate?: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;

  // Joined / Resolved data
  profile?: {
    firstName: string;
    lastName: string;
    personalEmail: string;
    phone?: string | null;
    address?: string | null;
    dateOfBirth?: Date | string | null;
    gender?: string | null;
    profilePhoto?: string | null;
  } | null;

  department?: {
    id: string;
    name: string;
  } | null;

  designation?: {
    id: string;
    name: string;
  } | null;

  branch?: {
    id: string;
    name: string;
  } | null;

  manager?: {
    id: string;
    employeeNumber?: string | null;
    name: string;
  } | null;

  dynamicFields?: {
    fieldDefinitionId: string;
    key: string;
    label: string;
    value: any;
  }[];
}
