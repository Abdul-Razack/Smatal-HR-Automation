export enum CandidateStatus {
  DRAFT = 'DRAFT',
  APPLIED = 'APPLIED',
  SCREENING = 'SCREENING',
  INTERVIEWING = 'INTERVIEWING',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  CONVERTED = 'CONVERTED',
}

export const CANDIDATE_STATUS_TRANSITIONS: Record<
  CandidateStatus,
  CandidateStatus[]
> = {
  [CandidateStatus.DRAFT]: [CandidateStatus.APPLIED, CandidateStatus.WITHDRAWN],
  [CandidateStatus.APPLIED]: [
    CandidateStatus.SCREENING,
    CandidateStatus.REJECTED,
    CandidateStatus.WITHDRAWN,
  ],
  [CandidateStatus.SCREENING]: [
    CandidateStatus.INTERVIEWING,
    CandidateStatus.REJECTED,
    CandidateStatus.WITHDRAWN,
  ],
  [CandidateStatus.INTERVIEWING]: [
    CandidateStatus.SELECTED,
    CandidateStatus.REJECTED,
    CandidateStatus.WITHDRAWN,
  ],
  [CandidateStatus.SELECTED]: [
    CandidateStatus.CONVERTED,
    CandidateStatus.REJECTED,
  ],
  [CandidateStatus.REJECTED]: [],
  [CandidateStatus.WITHDRAWN]: [],
  [CandidateStatus.CONVERTED]: [],
};
