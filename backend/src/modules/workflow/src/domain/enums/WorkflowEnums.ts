export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum WorkflowInstanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum WorkflowAction {
  START = 'START',
  ADVANCE = 'ADVANCE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RETURN = 'RETURN',
  CANCEL = 'CANCEL',
  COMPLETE = 'COMPLETE',
}

/**
 * Entity types that a workflow can be attached to.
 */
export enum WorkflowEntityType {
  CANDIDATE = 'CANDIDATE',
  EMPLOYEE = 'EMPLOYEE',
}

/**
 * Predefined lifecycle process codes — used to look up the correct definition.
 */
export enum LifecycleProcessCode {
  OFFER_LETTER = 'OFFER_LETTER',
  OFFER_ACCEPTANCE = 'OFFER_ACCEPTANCE',
  APPOINTMENT_ORDER = 'APPOINTMENT_ORDER',
  EMPLOYEE_CONFIRMATION = 'EMPLOYEE_CONFIRMATION',
  PROMOTION = 'PROMOTION',
  TRANSFER = 'TRANSFER',
  RESIGNATION = 'RESIGNATION',
  TERMINATION = 'TERMINATION',
  RELIEVING_LETTER = 'RELIEVING_LETTER',
  EXPERIENCE_LETTER = 'EXPERIENCE_LETTER',
  LEAVE_REQUEST = 'LEAVE_REQUEST',
}
