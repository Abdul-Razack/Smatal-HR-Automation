import {
  IRepository,
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';
import { WorkflowDefinitionAggregate } from '../aggregates/WorkflowDefinitionAggregate';
import { WorkflowStatus } from '../enums/WorkflowEnums';

export interface IWorkflowDefinitionRepository extends IRepository<WorkflowDefinitionAggregate> {
  findByProcessCodeAndCompany(
    processCode: string,
    companyId: string,
  ): Promise<WorkflowDefinitionAggregate | null>;
  findActiveByEntityTypeAndCompany(
    entityType: string,
    companyId: string,
  ): Promise<WorkflowDefinitionAggregate[]>;
  listByCompany(
    companyId: string,
    status?: WorkflowStatus,
    entityType?: string,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<WorkflowDefinitionAggregate>>;
}
