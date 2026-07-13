import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetWorkflowInstanceQuery } from './GetWorkflowInstanceQuery';
import { IWorkflowInstanceRepository } from '../../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { WorkflowInstanceMapper } from '../../../infrastructure/mappers/WorkflowInstanceMapper';
import { WorkflowInstanceResponseDto } from '../../dto/responses/WorkflowResponseDtos';

@QueryHandler(GetWorkflowInstanceQuery)
@Injectable()
export class GetWorkflowInstanceHandler implements IQueryHandler<GetWorkflowInstanceQuery> {
  constructor(
    @Inject('IWorkflowInstanceRepository')
    private readonly repo: IWorkflowInstanceRepository,
    private readonly domainService: WorkflowDomainService,
    private readonly mapper: WorkflowInstanceMapper,
  ) {}

  async execute(
    query: GetWorkflowInstanceQuery,
  ): Promise<WorkflowInstanceResponseDto> {
    const inst = this.domainService.assertInstanceBelongsToCompany(
      await this.repo.findById(query.instanceId),
      query.instanceId,
      query.companyId,
    );
    return this.mapper.toResponseDto(inst);
  }
}
