import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { AddWorkflowStageCommand } from './AddWorkflowStageCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(AddWorkflowStageCommand)
@Injectable()
export class AddWorkflowStageHandler implements ICommandHandler<AddWorkflowStageCommand> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(cmd: AddWorkflowStageCommand): Promise<Result<string>> {
    try {
      const def = this.domainService.assertDefinitionBelongsToCompany(
        await this.repo.findById(cmd.definitionId),
        cmd.definitionId,
        cmd.companyId,
      );
      const stageId = uuidv4();
      const now = new Date();
      def.addStage(
        {
          id: stageId,
          name: cmd.name,
          code: cmd.code,
          description: cmd.description ?? null,
          displayOrder: cmd.displayOrder,
          isTerminal: cmd.isTerminal,
          isFinal: cmd.isFinal,
          createdAt: now,
          updatedAt: now,
          createdBy: cmd.performedBy,
          updatedBy: cmd.performedBy,
        },
        cmd.performedBy,
      );
      await this.uow.withTransaction(async () => {
        await this.repo.save(def);
      });
      return Result.ok<string>(stageId);
    } catch (e: any) {
      return Result.fail<string>(e.message);
    }
  }
}
