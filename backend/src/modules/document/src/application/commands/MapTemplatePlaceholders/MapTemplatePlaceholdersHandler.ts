import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { MapTemplatePlaceholdersCommand } from './MapTemplatePlaceholdersCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

import { TemplatePlaceholderVO } from '../../../domain/value-objects/TemplatePlaceholderVO';
import { TemplateImportStatus } from '../../../domain/enums/DocumentEnums';
import { PlaceholderMappedEvent } from '../../../domain/events/PlaceholderMappedEvent';
import { FieldRuntimeService } from '../../../../../master/src/runtime/FieldRuntimeService';

@CommandHandler(MapTemplatePlaceholdersCommand)
@Injectable()
export class MapTemplatePlaceholdersHandler implements ICommandHandler<MapTemplatePlaceholdersCommand> {
  private readonly logger = new Logger(MapTemplatePlaceholdersHandler.name);

  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepo: ITemplateRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    private readonly eventBus: EventBus,
    private readonly fieldRegistry: FieldRuntimeService,
  ) {}

  async execute(
    command: MapTemplatePlaceholdersCommand,
  ): Promise<Result<void>> {
    try {
      // ── 1. Load Template & authorise tenant ──────────────────────────────
      const template = await this.templateRepo.findById(command.templateId);
      if (!template) {
        return Result.fail<void>(`Template not found: ${command.templateId}`);
      }
      if (template.companyId !== command.companyId) {
        return Result.fail<void>(
          `Unauthorized to modify template ${command.templateId}`,
        );
      }

      // ── 2. Find the specific version ─────────────────────────────────────
      const version = template.versions.find(
        (v) => v.id.toValue() === command.versionId,
      );
      if (!version) {
        return Result.fail<void>(
          `TemplateVersion not found: ${command.versionId}`,
        );
      }

      // ── 3. Validate mapping inputs ───────────────────────────────────────
      if (!command.mappings || command.mappings.length === 0) {
        return Result.fail<void>(
          'At least one placeholder mapping is required.',
        );
      }

      // Guard: duplicate placeholderKey in the submitted mappings
      const keys = command.mappings.map((m) => m.placeholderKey);
      const uniqueKeys = new Set(keys);
      if (uniqueKeys.size !== keys.length) {
        const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
        return Result.fail<void>(
          `Duplicate placeholder keys in mapping request: ${dupes.join(', ')}`,
        );
      }

      // Guard: Validate Field Definitions exist and are active
      const defIds = Array.from(
        new Set(command.mappings.map((m) => m.fieldDefinitionId)),
      );
      const invalidFields = await this.fieldRegistry.validateFieldDefinitions(
        command.companyId,
        defIds,
      );
      if (invalidFields.length > 0) {
        return Result.fail<void>(
          `Invalid or deleted field definitions mapped: ${invalidFields.join(', ')}`,
        );
      }

      // ── 4. Create TemplatePlaceholderVO objects ──────────────────────────
      const placeholderVOs = command.mappings.map((m) =>
        TemplatePlaceholderVO.create({
          id: randomUUID(),
          fieldDefinitionId: m.fieldDefinitionId,
          placeholderKey: m.placeholderKey,
          isRequired: m.isRequired,
          displayOrder: m.displayOrder,
        }),
      );

      // ── 5. Overwrite placeholders on the version entity ──────────────────
      // Access the mutable props array by replacing the placeholder list via the entity method.
      // The entity manages its own state; we reassign through props here.
      (version as any).props.placeholders = placeholderVOs;
      version.updateImportStatus(
        TemplateImportStatus.MAPPED,
        placeholderVOs.length,
      );

      // ── 6. Persist inside a transaction ──────────────────────────────────
      await this.unitOfWork.withTransaction(async () => {
        await this.templateRepo.save(template);
      });

      // ── 7. Publish domain event ───────────────────────────────────────────
      const unmappedCount = 0; // All submitted are mapped by definition
      this.eventBus.publish(
        new PlaceholderMappedEvent(
          command.templateId,
          command.versionId,
          command.companyId,
          placeholderVOs.length,
          unmappedCount,
          command.performedBy,
        ),
      );

      this.logger.log(
        `Placeholder mapping saved: templateId=${command.templateId}, ` +
          `versionId=${command.versionId}, mappings=${placeholderVOs.length}`,
      );

      return Result.ok<void>();
    } catch (error: any) {
      this.logger.error(`Mapping failed: ${error.message}`, error.stack);
      return Result.fail<void>(error.message);
    }
  }
}
