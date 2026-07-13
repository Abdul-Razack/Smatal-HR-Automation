import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectWorkflowStageCommand } from './RejectWorkflowStageCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowInstanceRepository } from '../../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(RejectWorkflowStageCommand)
@Injectable()
export class RejectWorkflowStageHandler implements ICommandHandler<RejectWorkflowStageCommand> {
  constructor(
    @Inject('IWorkflowInstanceRepository')
    private readonly repo: IWorkflowInstanceRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(cmd: RejectWorkflowStageCommand): Promise<Result<void>> {
    try {
      const inst = this.domainService.assertInstanceBelongsToCompany(
        await this.repo.findById(cmd.instanceId),
        cmd.instanceId,
        cmd.companyId,
      );
      inst.reject(cmd.performedBy, cmd.reason);
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
