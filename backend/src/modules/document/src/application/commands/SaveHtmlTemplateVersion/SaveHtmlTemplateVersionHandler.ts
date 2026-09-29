import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { SaveHtmlTemplateVersionCommand } from './SaveHtmlTemplateVersionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { TemplateVersionEntity } from '../../../domain/entities/TemplateVersionEntity';
import { TemplateVersionStatus } from '../../../domain/enums/DocumentEnums';
import { TemplatePlaceholderVO } from '../../../domain/value-objects/TemplatePlaceholderVO';
import { PlaceholderRegistryService } from '../../../domain/services/PlaceholderRegistryService';

export interface SaveHtmlTemplateVersionResult {
  versionId: string;
  versionNumber: number;
  detectedPlaceholders: string[];
  unknownPlaceholders: string[];
}

/** Scans a string for all {{key}} tokens */
function scanPlaceholders(html: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const keys = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    keys.add(m[1].trim());
  }
  return Array.from(keys);
}

@CommandHandler(SaveHtmlTemplateVersionCommand)
@Injectable()
export class SaveHtmlTemplateVersionHandler
  implements ICommandHandler<SaveHtmlTemplateVersionCommand>
{
  private readonly logger = new Logger(SaveHtmlTemplateVersionHandler.name);

  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepo: ITemplateRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
    private readonly placeholderRegistry: PlaceholderRegistryService,
  ) {}

  async execute(
    command: SaveHtmlTemplateVersionCommand,
  ): Promise<Result<SaveHtmlTemplateVersionResult>> {
    try {
      // 1. Validate content
      if (!command.content || command.content.trim().length === 0) {
        return Result.fail('Template content cannot be empty.');
      }

      // 2. Load template and enforce tenant ownership
      const template = await this.templateRepo.findById(command.templateId);
      if (!template) {
        return Result.fail(`Template not found: ${command.templateId}`);
      }
      if (template.companyId !== command.companyId) {
        return Result.fail(`Unauthorized to modify template ${command.templateId}`);
      }

      // 3. Scan placeholders in the HTML content
      const detectedKeys = scanPlaceholders(command.content);

      // 4. Validate each key exists in the registry
      const allPlaceholders = await this.placeholderRegistry.getPlaceholders(command.companyId);
      const registeredKeys = new Set(allPlaceholders.map((p) => p.key));
      const unknownKeys = detectedKeys.filter((k) => !registeredKeys.has(k));
      if (unknownKeys.length > 0) {
        return Result.fail(
          `Unknown placeholders detected: ${unknownKeys.map((k) => `{{${k}}}`).join(', ')}. ` +
            `Please use only registered placeholders.`,
        );
      }

      // 5. Build new TemplateVersionEntity
      const businessId = await this.idGenerator.generate('TVER');
      const versionNumber = template.versions.length + 1;

      const newVersion = TemplateVersionEntity.create(
        {
          businessId,
          templateId: template.id.toValue() as string,
          versionNumber,
          content: command.content,
          contentType: 'html',
          status: TemplateVersionStatus.DRAFT,
          placeholders: detectedKeys.map((key, index) =>
            TemplatePlaceholderVO.create({
              id: randomUUID(),
              placeholderKey: key,
              isRequired: true,
              displayOrder: index,
            }),
          ),
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

      // 6. Persist
      await this.unitOfWork.withTransaction(async () => {
        await this.templateRepo.save(template);
      });

      this.logger.log(
        `HTML version saved: templateId=${command.templateId}, ` +
          `versionId=${newVersion.id.toValue()}, v${versionNumber}, ` +
          `placeholders=${detectedKeys.length}`,
      );

      return Result.ok<SaveHtmlTemplateVersionResult>({
        versionId: newVersion.id.toValue() as string,
        versionNumber,
        detectedPlaceholders: detectedKeys,
        unknownPlaceholders: [],
      });
    } catch (error: any) {
      this.logger.error(`SaveHtmlTemplateVersion failed: ${error.message}`, error.stack);
      return Result.fail<SaveHtmlTemplateVersionResult>(error.message);
    }
  }
}
