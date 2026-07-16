import { Profile } from '../../profile/types';

export type CandidateStatus = 
  | 'DRAFT'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CONVERTED';

export interface Candidate {
  id: string;
  companyId: string;
  profileId: string;
  status: CandidateStatus;
  source?: string;
  referredBy?: string;
  notes?: string;
  appliedDate?: string;
  profile?: Profile; // Populated abstraction
}

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type InterviewType = 'TECHNICAL' | 'HR' | 'BEHAVIORAL' | 'MANAGEMENT';

export interface InterviewFeedback {
  rating: number;
  comments: string;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'NO_HIRE' | 'STRONG_NO_HIRE';
}

export interface Interview {
  id: string;
  candidateId: string;
  title: string;
  description?: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  location?: string;
  feedback?: InterviewFeedback;
}

export type OfferStatus = 'DRAFT' | 'GENERATED' | 'ACCEPTED' | 'REJECTED';

export interface Offer {
  id: string;
  candidateId: string;
  businessId: string;
  baseSalary: number;
  currency: string;
  joiningDate?: string;
  validUntil?: string;
  notes?: string;
  status: OfferStatus;
  createdAt: string;
}

export interface CandidateTimelineEvent {
  id: string;
  candidateId: string;
  type: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
}
