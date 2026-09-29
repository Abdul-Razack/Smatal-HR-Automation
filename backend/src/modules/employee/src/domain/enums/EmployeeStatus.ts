export enum EmployeeStatus {
  OFFER = 'OFFER',
  JOINED = 'JOINED',
  PROBATION = 'PROBATION',
  CONFIRMED = 'CONFIRMED',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
  RELIEVED = 'RELIEVED',
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
  [EmployeeStatus.OFFER]: [EmployeeStatus.JOINED],
  [EmployeeStatus.JOINED]: [
    EmployeeStatus.PROBATION,
    EmployeeStatus.CONFIRMED,
  ],
  [EmployeeStatus.PROBATION]: [
    EmployeeStatus.CONFIRMED,
    EmployeeStatus.TERMINATED,
  ],
  [EmployeeStatus.CONFIRMED]: [
    EmployeeStatus.NOTICE_PERIOD,
    EmployeeStatus.TERMINATED,
    EmployeeStatus.RETIRED,
  ],
  [EmployeeStatus.NOTICE_PERIOD]: [
    EmployeeStatus.RELIEVED,
    EmployeeStatus.CONFIRMED,
  ],
  [EmployeeStatus.RELIEVED]: [],
  // Legacy / alias states
  [EmployeeStatus.ONBOARDING]: [
    EmployeeStatus.JOINED,
    EmployeeStatus.ACTIVE,
  ],
  [EmployeeStatus.ACTIVE]: [
    EmployeeStatus.NOTICE_PERIOD,
    EmployeeStatus.NOTICE,
    EmployeeStatus.TERMINATED,
    EmployeeStatus.RESIGNED,
    EmployeeStatus.RETIRED,
  ],
  [EmployeeStatus.NOTICE]: [
    EmployeeStatus.RELIEVED,
    EmployeeStatus.ACTIVE,
    EmployeeStatus.TERMINATED,
    EmployeeStatus.RESIGNED,
  ],
  [EmployeeStatus.TERMINATED]: [],
  [EmployeeStatus.RESIGNED]: [],
  [EmployeeStatus.RETIRED]: [],
};

export function getValidNextStatuses(currentStatus: EmployeeStatus): EmployeeStatus[] {
  return EMPLOYEE_STATUS_TRANSITIONS[currentStatus] || [];
}

export function isValidStatusTransition(from: EmployeeStatus, to: EmployeeStatus): boolean {
  const allowed = EMPLOYEE_STATUS_TRANSITIONS[from];
  return !!allowed && allowed.includes(to);
}
