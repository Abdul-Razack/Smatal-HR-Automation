import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApproveWorkflowStageCommand } from './ApproveWorkflowStageCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { IWorkflowInstanceRepository } from '../../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { WorkflowNoCurrentStageException } from '../../../domain/exceptions/WorkflowExceptions';

@CommandHandler(ApproveWorkflowStageCommand)
@Injectable()
export class ApproveWorkflowStageHandler implements ICommandHandler<ApproveWorkflowStageCommand> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly defRepo: IWorkflowDefinitionRepository,
    @Inject('IWorkflowInstanceRepository')
    private readonly instRepo: IWorkflowInstanceRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(cmd: ApproveWorkflowStageCommand): Promise<Result<void>> {
    try {
      const inst = this.domainService.assertInstanceBelongsToCompany(
        await this.instRepo.findById(cmd.instanceId),
        cmd.instanceId,
        cmd.companyId,
      );
      if (!inst.currentStageId)
        throw new WorkflowNoCurrentStageException(inst.id.toString());
      const def = await this.defRepo.findById(inst.workflowDefinitionId);
      const nextStageId = def
        ? this.domainService.resolveNextStage(def, inst.currentStageId)
        : null;
      inst.approve(nextStageId, cmd.performedBy, cmd.remarks);
      await this.uow.withTransaction(async () => {
        await this.instRepo.save(inst);
        await this.instRepo.saveHistory(inst.history);
      });
      return Result.ok<void>();
    } catch (e: any) {
      return Result.fail<void>(e.message);
    }
  }
}
