import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PublishWorkflowDefinitionCommand } from './PublishWorkflowDefinitionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(PublishWorkflowDefinitionCommand)
@Injectable()
export class PublishWorkflowDefinitionHandler implements ICommandHandler<PublishWorkflowDefinitionCommand> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(cmd: PublishWorkflowDefinitionCommand): Promise<Result<void>> {
    try {
      const def = this.domainService.assertDefinitionBelongsToCompany(
        await this.repo.findById(cmd.definitionId),
        cmd.definitionId,
        cmd.companyId,
      );
      def.publish(cmd.performedBy);
      await this.uow.withTransaction(async () => {
        await this.repo.save(def);
      });
      return Result.ok<void>();
    } catch (e: any) {
      return Result.fail<void>(e.message);
    }
  }
}
