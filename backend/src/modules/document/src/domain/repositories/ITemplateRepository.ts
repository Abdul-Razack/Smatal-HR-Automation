import { TemplateAggregate } from '../aggregates/TemplateAggregate';

export interface ITemplateRepository {
  findById(id: string): Promise<TemplateAggregate | null>;
  findByBusinessId(businessId: string): Promise<TemplateAggregate | null>;
  save(template: TemplateAggregate): Promise<void>;
}
