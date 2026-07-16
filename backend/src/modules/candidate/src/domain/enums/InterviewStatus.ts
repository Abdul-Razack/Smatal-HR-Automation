export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export const INTERVIEW_STATUS_TRANSITIONS: Record<InterviewStatus, InterviewStatus[]> = {
  [InterviewStatus.SCHEDULED]: [InterviewStatus.COMPLETED, InterviewStatus.CANCELLED, InterviewStatus.RESCHEDULED],
  [InterviewStatus.COMPLETED]: [],
  [InterviewStatus.CANCELLED]: [],
  [InterviewStatus.RESCHEDULED]: [InterviewStatus.COMPLETED, InterviewStatus.CANCELLED, InterviewStatus.RESCHEDULED],
};
