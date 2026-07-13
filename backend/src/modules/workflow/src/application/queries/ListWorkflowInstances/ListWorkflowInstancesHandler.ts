import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListWorkflowInstancesQuery } from './ListWorkflowInstancesQuery';
import { IWorkflowInstanceRepository } from '../../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowInstanceMapper } from '../../../infrastructure/mappers/WorkflowInstanceMapper';
import { IPaginatedResult } from '../../../../../../kernel/repositories/repository.contracts';
import { WorkflowInstanceResponseDto } from '../../dto/responses/WorkflowResponseDtos';

@QueryHandler(ListWorkflowInstancesQuery)
@Injectable()
export class ListWorkflowInstancesHandler implements IQueryHandler<ListWorkflowInstancesQuery> {
  constructor(
    @Inject('IWorkflowInstanceRepository')
    private readonly repo: IWorkflowInstanceRepository,
    private readonly mapper: WorkflowInstanceMapper,
  ) {}

  async execute(
    query: ListWorkflowInstancesQuery,
  ): Promise<IPaginatedResult<WorkflowInstanceResponseDto>> {
    const result = await this.repo.listByCompany(
      query.companyId,
      query.status,
      query.entityType,
      query.entityId,
      { page: query.page, limit: query.limit },
      { field: 'createdAt', direction: 'desc' },
    );
    return {
      ...result,
      data: result.data.map((i) => this.mapper.toResponseDto(i)),
    };
  }
}
