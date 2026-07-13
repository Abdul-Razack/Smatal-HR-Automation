import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTemplateVersionCommand } from './CreateTemplateVersionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { TemplateVersionEntity } from '../../../domain/entities/TemplateVersionEntity';
import { TemplateVersionStatus } from '../../../domain/enums/DocumentEnums';
import { TemplatePlaceholderVO } from '../../../domain/value-objects/TemplatePlaceholderVO';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { randomUUID } from 'crypto';

@CommandHandler(CreateTemplateVersionCommand)
@Injectable()
export class CreateTemplateVersionHandler implements ICommandHandler<CreateTemplateVersionCommand> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly repository: ITemplateRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
  ) {}

  async execute(
    command: CreateTemplateVersionCommand,
  ): Promise<Result<string>> {
    try {
      const template = await this.repository.findById(command.templateId);
      if (!template) {
        return Result.fail<string>(`Template not found: ${command.templateId}`);
      }
      if (template.companyId !== command.companyId) {
        return Result.fail<string>(
          `Unauthorized to modify template ${command.templateId}`,
        );
      }

      const businessId = await this.idGenerator.generate('TVER');
      const versionNumber = template.versions.length + 1;

      const placeholders = command.placeholders.map((p) =>
        TemplatePlaceholderVO.create({
          id: randomUUID(),
          fieldDefinitionId: p.fieldDefinitionId,
          placeholderKey: p.placeholderKey,
          isRequired: p.isRequired,
          displayOrder: p.displayOrder,
        }),
      );

      const newVersion = TemplateVersionEntity.create(
        {
          businessId,
          templateId: template.id.toValue() as string,
          versionNumber,
          content: command.content,
          contentType: command.contentType,
          status: TemplateVersionStatus.DRAFT,
          placeholders,
          notes: command.notes,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        new Identifier<string>(randomUUID()),
      );

      template.addVersion(newVersion);

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(template);
      });

      return Result.ok<string>(newVersion.id.toValue() as string);
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
