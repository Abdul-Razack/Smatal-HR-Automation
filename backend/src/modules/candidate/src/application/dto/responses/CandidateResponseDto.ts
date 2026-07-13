import { CandidateStatus } from '../../../domain/enums/CandidateStatus';

export class CandidateResponseDto {
  id: string;
  businessId: string;
  companyId: string;
  profileId: string;
  status: CandidateStatus;
  appliedDate?: Date | null;
  source?: string | null;
  referredBy?: string | null;
  notes?: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}
