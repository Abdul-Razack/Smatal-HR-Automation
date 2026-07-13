export enum EmployeeStatus {
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  NOTICE = 'NOTICE',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
  RETIRED = 'RETIRED',
}

export const EMPLOYEE_STATUS_TRANSITIONS: Record<
  EmployeeStatus,
  EmployeeStatus[]
> = {
  [EmployeeStatus.ONBOARDING]: [EmployeeStatus.ACTIVE],
  [EmployeeStatus.ACTIVE]: [
    EmployeeStatus.NOTICE,
    EmployeeStatus.TERMINATED,
    EmployeeStatus.RESIGNED,
    EmployeeStatus.RETIRED,
  ],
  [EmployeeStatus.NOTICE]: [
    EmployeeStatus.ACTIVE,
    EmployeeStatus.TERMINATED,
    EmployeeStatus.RESIGNED,
  ],
  [EmployeeStatus.TERMINATED]: [],
  [EmployeeStatus.RESIGNED]: [],
  [EmployeeStatus.RETIRED]: [],
};
