import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListWorkflowDefinitionsQuery } from './ListWorkflowDefinitionsQuery';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowDefinitionMapper } from '../../../infrastructure/mappers/WorkflowDefinitionMapper';
import { IPaginatedResult } from '../../../../../../kernel/repositories/repository.contracts';
import { WorkflowDefinitionResponseDto } from '../../dto/responses/WorkflowResponseDtos';

@QueryHandler(ListWorkflowDefinitionsQuery)
@Injectable()
export class ListWorkflowDefinitionsHandler implements IQueryHandler<ListWorkflowDefinitionsQuery> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
    private readonly mapper: WorkflowDefinitionMapper,
  ) {}

  async execute(
    query: ListWorkflowDefinitionsQuery,
  ): Promise<IPaginatedResult<WorkflowDefinitionResponseDto>> {
    const result = await this.repo.listByCompany(
      query.companyId,
      query.status,
      query.entityType,
      { page: query.page, limit: query.limit },
      { field: 'createdAt', direction: 'desc' },
    );
    return {
      ...result,
      data: result.data.map((d) => this.mapper.toResponseDto(d)),
    };
  }
}
