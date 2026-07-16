import { TemplateAggregate } from '../aggregates/TemplateAggregate';

export interface ITemplateRepository {
  findById(id: string): Promise<TemplateAggregate | null>;
  findByBusinessId(businessId: string): Promise<TemplateAggregate | null>;
  findManyPaginated(
    params: any,
  ): Promise<{ items: TemplateAggregate[]; total: number }>;
  save(template: TemplateAggregate): Promise<void>;
}
