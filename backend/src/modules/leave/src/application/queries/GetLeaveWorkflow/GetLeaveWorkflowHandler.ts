import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeaveWorkflowQuery } from './GetLeaveWorkflowQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowInstanceRepository } from '../../../../../workflow/src/domain/repositories/IWorkflowInstanceRepository';
import { WorkflowInstanceAggregate } from '../../../../../workflow/src/domain/aggregates/WorkflowInstanceAggregate';

@QueryHandler(GetLeaveWorkflowQuery)
@Injectable()
export class GetLeaveWorkflowHandler implements IQueryHandler<GetLeaveWorkflowQuery> {
  constructor(
    @Inject('IWorkflowInstanceRepository')
    private readonly workflowInstanceRepo: IWorkflowInstanceRepository,
  ) {}

  async execute(
    query: GetLeaveWorkflowQuery,
  ): Promise<Result<WorkflowInstanceAggregate>> {
    try {
      const instance =
        await this.workflowInstanceRepo.findActiveByEntityAndCompany(
          query.leaveRequestId,
          query.companyId,
        );

      if (!instance) {
        return Result.fail<WorkflowInstanceAggregate>(
          'Workflow instance not found or not active',
        );
      }

      return Result.ok<WorkflowInstanceAggregate>(instance);
    } catch (error: any) {
      return Result.fail<WorkflowInstanceAggregate>(error.message);
    }
  }
}
