import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { StartWorkflowInstanceCommand } from './StartWorkflowInstanceCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { IWorkflowInstanceRepository } from '../../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { WorkflowInstanceAggregate } from '../../../domain/aggregates/WorkflowInstanceAggregate';
import { WorkflowInstanceStatus } from '../../../domain/enums/WorkflowEnums';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { BUSINESS_ID_PREFIXES } from '../../../../../../infrastructure/database/BusinessIdGenerator';
import { WorkflowDefinitionHasNoStagesException } from '../../../domain/exceptions/WorkflowExceptions';

@CommandHandler(StartWorkflowInstanceCommand)
@Injectable()
export class StartWorkflowInstanceHandler implements ICommandHandler<StartWorkflowInstanceCommand> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly defRepo: IWorkflowDefinitionRepository,
    @Inject('IWorkflowInstanceRepository')
    private readonly instRepo: IWorkflowInstanceRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGen: IBusinessIdGenerator,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(cmd: StartWorkflowInstanceCommand): Promise<Result<string>> {
    try {
      const def = this.domainService.assertDefinitionBelongsToCompany(
        await this.defRepo.findById(cmd.workflowDefinitionId),
        cmd.workflowDefinitionId,
        cmd.companyId,
      );
      this.domainService.assertDefinitionCanStartInstance(def, cmd.companyId);

      const firstStage = def.getFirstStage();
      if (!firstStage)
        throw new WorkflowDefinitionHasNoStagesException(def.id.toString());

      const id = uuidv4();
      const businessId = await this.idGen.generate(
        BUSINESS_ID_PREFIXES.WORKFLOW_INSTANCE,
      );
      const now = new Date();

      const instance = WorkflowInstanceAggregate.create(
        {
          businessId,
          companyId: new Identifier<string>(cmd.companyId),
          workflowDefinitionId: cmd.workflowDefinitionId,
          entityType: cmd.entityType,
          entityId: cmd.entityId,
          candidateId: cmd.candidateId ?? null,
          employeeId: cmd.employeeId ?? null,
          currentStageId: null,
          status: WorkflowInstanceStatus.PENDING,
          startedAt: null,
          completedAt: null,
          definitionStageIds: def.orderedStages.map((s) => s.id),
          history: [],
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

      // Start immediately — move to IN_PROGRESS at first stage
      instance.start(firstStage.id, cmd.performedBy);

      await this.uow.withTransaction(async () => {
        await this.instRepo.save(instance);
        await this.instRepo.saveHistory(instance.history);
      });

      return Result.ok<string>(id);
    } catch (e: any) {
      return Result.fail<string>(e.message);
    }
  }
}
