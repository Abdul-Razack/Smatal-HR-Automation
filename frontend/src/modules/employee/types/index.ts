import { Profile } from '../../profile/types';

export type EmployeeStatus = 
  | 'ONBOARDING'
  | 'ACTIVE'
  | 'ON_LEAVE'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'RESIGNED';

export interface Employee {
  id: string;
  companyId: string;
  profileId: string;
  employeeNumber?: string;
  status: EmployeeStatus;
  joinedDate: string;
  probationEndDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  
  // Organization Mapping
  departmentId?: string;
  designationId?: string;
  branchId?: string;
  reportsToId?: string;

  profile?: Profile; // Populated abstraction
  dynamicFields?: { fieldDefinitionId: string; value: any }[];
}
