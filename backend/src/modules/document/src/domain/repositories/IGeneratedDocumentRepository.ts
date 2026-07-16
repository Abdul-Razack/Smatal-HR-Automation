import { GeneratedDocumentAggregate } from '../aggregates/GeneratedDocumentAggregate';

export interface IGeneratedDocumentRepository {
  findById(id: string): Promise<GeneratedDocumentAggregate | null>;
  findByBusinessId(
    businessId: string,
  ): Promise<GeneratedDocumentAggregate | null>;
  findAll(
    companyId: string,
    filters?: { profileId?: string; candidateId?: string; employeeId?: string },
  ): Promise<GeneratedDocumentAggregate[]>;
  save(document: GeneratedDocumentAggregate): Promise<void>;
}
