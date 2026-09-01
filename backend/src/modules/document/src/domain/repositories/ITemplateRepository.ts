import { TemplateAggregate } from '../aggregates/TemplateAggregate';

export interface ITemplateRepository {
  findById(id: string): Promise<TemplateAggregate | null>;
  findByBusinessId(businessId: string): Promise<TemplateAggregate | null>;
  findByDocumentTypeId(documentTypeId: string): Promise<TemplateAggregate[]>;
  findManyPaginated(
    params: any,
  ): Promise<{ items: TemplateAggregate[]; total: number }>;
  save(template: TemplateAggregate): Promise<void>;
}
