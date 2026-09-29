import { GeneratedDocumentAggregate } from '../aggregates/GeneratedDocumentAggregate';

export interface GeneratedDocumentFilters {
  profileId?: string;
  candidateId?: string;
  employeeId?: string;
  documentTypeId?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface IGeneratedDocumentRepository {
  findById(id: string): Promise<GeneratedDocumentAggregate | null>;
  findByBusinessId(
    businessId: string,
  ): Promise<GeneratedDocumentAggregate | null>;
  findAll(
    companyId: string,
    filters?: GeneratedDocumentFilters,
  ): Promise<GeneratedDocumentAggregate[]>;
  save(document: GeneratedDocumentAggregate): Promise<void>;
}
