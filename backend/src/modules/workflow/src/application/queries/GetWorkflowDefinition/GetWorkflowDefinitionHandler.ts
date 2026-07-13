import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetWorkflowDefinitionQuery } from './GetWorkflowDefinitionQuery';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { WorkflowDefinitionMapper } from '../../../infrastructure/mappers/WorkflowDefinitionMapper';
import { WorkflowDefinitionResponseDto } from '../../dto/responses/WorkflowResponseDtos';

@QueryHandler(GetWorkflowDefinitionQuery)
@Injectable()
export class GetWorkflowDefinitionHandler implements IQueryHandler<GetWorkflowDefinitionQuery> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
    private readonly domainService: WorkflowDomainService,
    private readonly mapper: WorkflowDefinitionMapper,
  ) {}

  async execute(
    query: GetWorkflowDefinitionQuery,
  ): Promise<WorkflowDefinitionResponseDto> {
    const def = this.domainService.assertDefinitionBelongsToCompany(
      await this.repo.findById(query.definitionId),
      query.definitionId,
      query.companyId,
    );
    return this.mapper.toResponseDto(def);
  }
}
