import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReturnWorkflowStageCommand } from './ReturnWorkflowStageCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowInstanceRepository } from '../../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(ReturnWorkflowStageCommand)
@Injectable()
export class ReturnWorkflowStageHandler implements ICommandHandler<ReturnWorkflowStageCommand> {
  constructor(
    @Inject('IWorkflowInstanceRepository')
    private readonly repo: IWorkflowInstanceRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(cmd: ReturnWorkflowStageCommand): Promise<Result<void>> {
    try {
      const inst = this.domainService.assertInstanceBelongsToCompany(
        await this.repo.findById(cmd.instanceId),
        cmd.instanceId,
        cmd.companyId,
      );
      inst.returnToStage(cmd.targetStageId, cmd.performedBy, cmd.reason);
      await this.uow.withTransaction(async () => {
        await this.repo.save(inst);
        await this.repo.saveHistory(inst.history);
      });
      return Result.ok<void>();
    } catch (e: any) {
      return Result.fail<void>(e.message);
    }
  }
}
