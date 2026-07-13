import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PublishTemplateVersionCommand } from './PublishTemplateVersionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(PublishTemplateVersionCommand)
@Injectable()
export class PublishTemplateVersionHandler implements ICommandHandler<PublishTemplateVersionCommand> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly repository: ITemplateRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: PublishTemplateVersionCommand): Promise<Result<void>> {
    try {
      const template = await this.repository.findById(command.templateId);
      if (!template) {
        return Result.fail(`Template not found: ${command.templateId}`);
      }
      if (template.companyId !== command.companyId) {
        return Result.fail(
          `Unauthorized to modify template ${command.templateId}`,
        );
      }

      template.publishVersion(command.versionId, command.performedBy);

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(template);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
