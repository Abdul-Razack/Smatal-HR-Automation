import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetWorkflowHistoryQuery } from './GetWorkflowHistoryQuery';
import { IWorkflowInstanceRepository } from '../../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { WorkflowHistoryResponseDto } from '../../dto/responses/WorkflowResponseDtos';

@QueryHandler(GetWorkflowHistoryQuery)
@Injectable()
export class GetWorkflowHistoryHandler implements IQueryHandler<GetWorkflowHistoryQuery> {
  constructor(
    @Inject('IWorkflowInstanceRepository')
    private readonly repo: IWorkflowInstanceRepository,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(
    query: GetWorkflowHistoryQuery,
  ): Promise<WorkflowHistoryResponseDto[]> {
    this.domainService.assertInstanceBelongsToCompany(
      await this.repo.findById(query.instanceId),
      query.instanceId,
      query.companyId,
    );
    const history = await this.repo.findHistoryByInstance(query.instanceId);
    return history.map((h) => ({
      id: h.id,
      workflowInstanceId: h.workflowInstanceId,
      stageId: h.stageId,
      action: h.action,
      notes: h.notes,
      performedBy: h.performedBy,
      performedAt: h.performedAt,
      metadata: h.metadata ?? undefined,
    }));
  }
}
