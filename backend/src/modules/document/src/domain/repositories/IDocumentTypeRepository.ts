import { DocumentTypeAggregate } from '../aggregates/DocumentTypeAggregate';

export interface IDocumentTypeRepository {
  findById(id: string): Promise<DocumentTypeAggregate | null>;
  findByBusinessId(businessId: string): Promise<DocumentTypeAggregate | null>;
  findByCode(companyId: string, code: string): Promise<DocumentTypeAggregate | null>;
  save(documentType: DocumentTypeAggregate): Promise<void>;
}
