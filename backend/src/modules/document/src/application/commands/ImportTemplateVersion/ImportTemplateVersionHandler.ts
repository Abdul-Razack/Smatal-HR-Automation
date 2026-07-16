import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';

import { ImportTemplateVersionCommand } from './ImportTemplateVersionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { Identifier } from '../../../../../../kernel/domain/Identifier';

import { TemplateVersionEntity } from '../../../domain/entities/TemplateVersionEntity';
import {
  TemplateVersionStatus,
  TemplateImportStatus,
} from '../../../domain/enums/DocumentEnums';
import { TemplateImportedEvent } from '../../../domain/events/TemplateImportedEvent';

import { DocxParser } from '../../../infrastructure/parsers/DocxParser';
import { StorageFactory } from '../../../../../../infrastructure/storage/StorageFactory';
import {
  InvalidMimeTypeException,
  InvalidFileExtensionException,
  FileTooLargeException,
  EmptyFileException,
  DuplicatePlaceholderException,
} from '../../../domain/exceptions/DocumentV2Exceptions';

const ALLOWED_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const ALLOWED_EXTENSION = '.docx';
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export interface ImportTemplateVersionResult {
  versionId: string;
  detectedPlaceholders: string[];
  imageCount: number;
  hasHeaders: boolean;
  hasFooters: boolean;
}

@CommandHandler(ImportTemplateVersionCommand)
@Injectable()
export class ImportTemplateVersionHandler implements ICommandHandler<ImportTemplateVersionCommand> {
  private readonly logger = new Logger(ImportTemplateVersionHandler.name);

  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepo: ITemplateRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
    private readonly docxParser: DocxParser,
    private readonly storageFactory: StorageFactory,
    private readonly eventBus: EventBus,
  ) {}

  async execute(
    command: ImportTemplateVersionCommand,
  ): Promise<Result<ImportTemplateVersionResult>> {
    try {
      // ── 1. Validate file presence ────────────────────────────────────────
      if (!command.fileBuffer || command.fileBuffer.length === 0) {
        throw new EmptyFileException();
      }

      // ── 2. Validate file size ────────────────────────────────────────────
      if (command.fileSize > MAX_FILE_SIZE_BYTES) {
        throw new FileTooLargeException(MAX_FILE_SIZE_BYTES);
      }

      // ── 3. Validate MIME type ────────────────────────────────────────────
      if (command.mimeType !== ALLOWED_MIME_TYPE) {
        throw new InvalidMimeTypeException(command.mimeType);
      }

      // ── 4. Validate file extension ───────────────────────────────────────
      const ext = command.originalFilename
        .slice(command.originalFilename.lastIndexOf('.'))
        .toLowerCase();
      if (ext !== ALLOWED_EXTENSION) {
        throw new InvalidFileExtensionException(ext);
      }

      // ── 5. Validate OpenXML structure + parse placeholders ───────────────
      await this.docxParser.validate(command.fileBuffer);
      const scanResult = await this.docxParser.parse(command.fileBuffer);

      // ── 6. Guard against duplicate placeholders ──────────────────────────
      if (scanResult.placeholders.duplicates.length > 0) {
        throw new DuplicatePlaceholderException(
          scanResult.placeholders.duplicates,
        );
      }

      // ── 7. Load parent Template + authorise tenant ───────────────────────
      const template = await this.templateRepo.findById(command.templateId);
      if (!template) {
        return Result.fail<ImportTemplateVersionResult>(
          `Template not found: ${command.templateId}`,
        );
      }
      if (template.companyId !== command.companyId) {
        return Result.fail<ImportTemplateVersionResult>(
          `Unauthorized to modify template ${command.templateId}`,
        );
      }

      // ── 8. Upload original DOCX to storage ──────────────────────────────
      const storageKey = `templates/${command.companyId}/${command.templateId}/${randomUUID()}/original.docx`;
      const storage = this.storageFactory.getService();
      const uploadResult = await storage.upload(
        storageKey,
        command.fileBuffer,
        ALLOWED_MIME_TYPE,
      );

      // ── 9. Create the new TemplateVersionEntity ──────────────────────────
      const businessId = await this.idGenerator.generate('TVER');
      const versionNumber = template.versions.length + 1;

      const newVersion = TemplateVersionEntity.create(
        {
          businessId,
          templateId: template.id.toValue() as string,
          versionNumber,
          content: '', // V2: No HTML content; file lives in storage
          contentType: 'docx', // Differentiates V2 from legacy V1 HTML versions
          status: TemplateVersionStatus.DRAFT,
          placeholders: [], // Populated in MapTemplatePlaceholdersHandler
          notes: command.notes,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
          // V2 fields
          storageUri: uploadResult.uri,
          originalFilename: command.originalFilename,
          mimeType: command.mimeType,
          fileSize: command.fileSize,
          checksum: uploadResult.checksum,
          placeholderCount: scanResult.placeholders.detected.length,
          importStatus: TemplateImportStatus.MAPPING_REQUIRED,
        },
        new Identifier<string>(randomUUID()),
      );

      template.addVersion(newVersion);

      // ── 10. Persist inside a transaction ─────────────────────────────────
      await this.unitOfWork.withTransaction(async () => {
        await this.templateRepo.save(template);
      });

      // ── 11. Publish domain event (Audit/Notifications subscribe to this) ─
      this.eventBus.publish(
        new TemplateImportedEvent(
          command.templateId,
          newVersion.id.toValue() as string,
          command.companyId,
          command.originalFilename,
          scanResult.placeholders.detected,
          command.performedBy,
        ),
      );

      this.logger.log(
        `DOCX imported successfully: templateId=${command.templateId}, ` +
          `versionId=${newVersion.id.toValue()}, placeholders=${scanResult.placeholders.detected.length}`,
      );

      return Result.ok<ImportTemplateVersionResult>({
        versionId: newVersion.id.toValue() as string,
        detectedPlaceholders: scanResult.placeholders.detected,
        imageCount: scanResult.imageCount,
        hasHeaders: scanResult.hasHeaders,
        hasFooters: scanResult.hasFooters,
      });
    } catch (error: any) {
      this.logger.error(`Import failed: ${error.message}`, error.stack);
      return Result.fail<ImportTemplateVersionResult>(error.message);
    }
  }
}
