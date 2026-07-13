import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CreateWorkflowDefinitionCommand } from './CreateWorkflowDefinitionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { WorkflowDefinitionAggregate } from '../../../domain/aggregates/WorkflowDefinitionAggregate';
import { WorkflowStatus } from '../../../domain/enums/WorkflowEnums';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { BUSINESS_ID_PREFIXES } from '../../../../../../infrastructure/database/BusinessIdGenerator';

@CommandHandler(CreateWorkflowDefinitionCommand)
@Injectable()
export class CreateWorkflowDefinitionHandler implements ICommandHandler<CreateWorkflowDefinitionCommand> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGen: IBusinessIdGenerator,
  ) {}

  async execute(cmd: CreateWorkflowDefinitionCommand): Promise<Result<string>> {
    try {
      const id = uuidv4();
      const businessId = await this.idGen.generate(
        BUSINESS_ID_PREFIXES.WORKFLOW,
      );
      const now = new Date();
      const def = WorkflowDefinitionAggregate.create(
        {
          businessId,
          companyId: new Identifier<string>(cmd.companyId),
          name: cmd.name,
          description: cmd.description ?? null,
          entityType: cmd.entityType,
          processCode: cmd.processCode ?? null,
          status: WorkflowStatus.DRAFT,
          stages: [],
          version: 1,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
          createdBy: cmd.performedBy,
          updatedBy: cmd.performedBy,
        },
        new Identifier<string>(id),
        cmd.performedBy,
      );
      await this.uow.withTransaction(async () => {
        await this.repo.save(def);
      });
      return Result.ok<string>(id);
    } catch (e: any) {
      return Result.fail<string>(e.message);
    }
  }
}
