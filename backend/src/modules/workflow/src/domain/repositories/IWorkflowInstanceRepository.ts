import {
  IRepository,
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';
import { WorkflowInstanceAggregate } from '../aggregates/WorkflowInstanceAggregate';
import { WorkflowInstanceStatus } from '../enums/WorkflowEnums';
import { WorkflowHistoryEntity } from '../entities/WorkflowHistoryEntity';

export interface IWorkflowInstanceRepository extends IRepository<WorkflowInstanceAggregate> {
  findByEntityAndCompany(
    entityId: string,
    companyId: string,
  ): Promise<WorkflowInstanceAggregate[]>;
  findActiveByEntityAndCompany(
    entityId: string,
    companyId: string,
  ): Promise<WorkflowInstanceAggregate | null>;
  listByCompany(
    companyId: string,
    status?: WorkflowInstanceStatus,
    entityType?: string,
    entityId?: string,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<WorkflowInstanceAggregate>>;
  saveHistory(entries: WorkflowHistoryEntity[]): Promise<void>;
  findHistoryByInstance(instanceId: string): Promise<WorkflowHistoryEntity[]>;
}
