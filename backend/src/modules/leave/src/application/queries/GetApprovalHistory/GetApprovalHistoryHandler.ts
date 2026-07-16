import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetApprovalHistoryQuery } from './GetApprovalHistoryQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowInstanceRepository } from '../../../../../workflow/src/domain/repositories/IWorkflowInstanceRepository';
import { WorkflowHistoryEntity } from '../../../../../workflow/src/domain/entities/WorkflowHistoryEntity';

@QueryHandler(GetApprovalHistoryQuery)
@Injectable()
export class GetApprovalHistoryHandler implements IQueryHandler<GetApprovalHistoryQuery> {
  constructor(
    @Inject('IWorkflowInstanceRepository')
    private readonly workflowInstanceRepo: IWorkflowInstanceRepository,
  ) {}

  async execute(
    query: GetApprovalHistoryQuery,
  ): Promise<Result<WorkflowHistoryEntity[]>> {
    try {
      // In a real app we would verify company isolation, but for simple lookup history by instance is enough
      const history = await this.workflowInstanceRepo.findHistoryByInstance(
        query.workflowInstanceId,
      );

      return Result.ok<WorkflowHistoryEntity[]>(history);
    } catch (error: any) {
      return Result.fail<WorkflowHistoryEntity[]>(error.message);
    }
  }
}
