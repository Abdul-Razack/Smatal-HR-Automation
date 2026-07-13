import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateWorkflowDefinitionCommand } from './UpdateWorkflowDefinitionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IWorkflowDefinitionRepository } from '../../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowDomainService } from '../../../domain/services/WorkflowDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(UpdateWorkflowDefinitionCommand)
@Injectable()
export class UpdateWorkflowDefinitionHandler implements ICommandHandler<UpdateWorkflowDefinitionCommand> {
  constructor(
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
    @Inject('IUnitOfWork') private readonly uow: IUnitOfWork,
    private readonly domainService: WorkflowDomainService,
  ) {}

  async execute(cmd: UpdateWorkflowDefinitionCommand): Promise<Result<void>> {
    try {
      const def = this.domainService.assertDefinitionBelongsToCompany(
        await this.repo.findById(cmd.definitionId),
        cmd.definitionId,
        cmd.companyId,
      );
      def.update(cmd.name, cmd.description, cmd.performedBy);
      await this.uow.withTransaction(async () => {
        await this.repo.save(def);
      });
      return Result.ok<void>();
    } catch (e: any) {
      return Result.fail<void>(e.message);
    }
  }
}
