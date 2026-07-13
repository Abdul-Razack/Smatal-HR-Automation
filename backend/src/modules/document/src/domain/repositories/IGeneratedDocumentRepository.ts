import { GeneratedDocumentAggregate } from '../aggregates/GeneratedDocumentAggregate';

export interface IGeneratedDocumentRepository {
  findById(id: string): Promise<GeneratedDocumentAggregate | null>;
  findByBusinessId(
    businessId: string,
  ): Promise<GeneratedDocumentAggregate | null>;
  save(document: GeneratedDocumentAggregate): Promise<void>;
}
