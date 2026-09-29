import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DocumentGeneratorFactory } from '../../infrastructure/generators/DocumentGeneratorFactory';
import { IStorageService } from '../../../../../infrastructure/storage/IStorageService';
import { PdfGenerationService } from '../../infrastructure/services/PdfGenerationService';
import { HtmlConverterService } from '../../infrastructure/services/HtmlConverterService';
import { TemplateLoader } from '../../infrastructure/services/TemplateLoader';
import { DocumentSnapshotBuilder } from '../../domain/builders/DocumentSnapshotBuilder';
import { StoragePathBuilder } from '../../../../../infrastructure/storage/StoragePathBuilder';
import { GeneratedDocumentAggregate } from '../../domain/aggregates/GeneratedDocumentAggregate';
import { TemplateAggregate } from '../../domain/aggregates/TemplateAggregate';
import { TemplateVersionEntity } from '../../domain/entities/TemplateVersionEntity';
import { DocumentRenderContext } from '../../domain/models/DocumentRenderContext';
import { GenerationValidator } from '../../domain/services/GenerationValidator';
import { DocumentSnapshotVO } from '../../domain/value-objects/DocumentSnapshotVO';
import { AutomaticResolverService } from '../../domain/services/AutomaticResolverService';
import { PrismaEntityDataProvider } from '../../infrastructure/data/PrismaEntityDataProvider';
import {
  RenderingException,
  StorageException,
  PdfConversionException,
} from '../../domain/exceptions/DocumentV2Exceptions';
import {
  DocumentGenerationStartedEvent,
  DocumentGenerationCompletedEvent,
  DocumentGenerationFailedEvent,
} from '../../domain/events/DocumentEvents';
import { IUnitOfWork } from '../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IGeneratedDocumentRepository } from '../../domain/repositories/IGeneratedDocumentRepository';

function scanHtmlPlaceholders(html: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const keys = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) keys.add(m[1].trim());
  return Array.from(keys);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Injectable()
export class GenerationOrchestrator {
  private readonly logger = new Logger(GenerationOrchestrator.name);

  constructor(
    private readonly validator: GenerationValidator,
    private readonly generatorFactory: DocumentGeneratorFactory,
    private readonly templateLoader: TemplateLoader,
    private readonly pdfGenerationService: PdfGenerationService,
    private readonly htmlConverter: HtmlConverterService,
    private readonly automaticResolver: AutomaticResolverService,
    private readonly dataProvider: PrismaEntityDataProvider,
    @Inject('IStorageService') private readonly storageService: IStorageService,
    private readonly snapshotBuilder: DocumentSnapshotBuilder,
    private readonly eventBus: EventBus,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IGeneratedDocumentRepository')
    private readonly documentRepo: IGeneratedDocumentRepository,
  ) {}

  async execute(
    document: GeneratedDocumentAggregate,
    template: TemplateAggregate,
    activeVersion: TemplateVersionEntity,
    context: DocumentRenderContext,
    performedBy: string,
  ): Promise<DocumentSnapshotVO[]> {
    const startTime = Date.now();

    // 1. Publish Started Event
    this.eventBus.publish(
      new DocumentGenerationStartedEvent(
        document.id.toValue() as string,
        document.businessId,
        document.companyId,
        template.id.toValue() as string,
        performedBy,
        new Date(),
      ),
    );

    try {
      // 2. Resolve Placeholders using Centralized AutomaticResolverService
      let placeholderKeys: string[] = [];
      if (activeVersion.contentType === 'html') {
        placeholderKeys = scanHtmlPlaceholders(activeVersion.content || '');
      } else {
        placeholderKeys = (activeVersion.placeholders || []).map(
          (p) => p.placeholderKey,
        );
      }

      if (placeholderKeys.length > 0) {
        const resolution = await this.automaticResolver.resolvePlaceholders(
          placeholderKeys,
          {
            companyId: document.companyId,
            profileId: context.profileId || document.entityId,
            candidateId:
              document.entityType === 'CANDIDATE' ? document.entityId : undefined,
            employeeId:
              document.entityType === 'EMPLOYEE' ? document.entityId : undefined,
          },
          this.dataProvider,
        );

        context.placeholders = {
          ...resolution.resolvedValues,
          ...context.placeholders,
        };
      }

      // 3. Pre-render Validation (Tenant match, version published, required placeholders)
      this.validator.validatePreRender(
        document,
        template,
        activeVersion,
        context,
      );

      let primarySnapshot: DocumentSnapshotVO;
      let pdfSnapshot: DocumentSnapshotVO;

      if (activeVersion.contentType === 'html') {
        // ── HTML Pipeline ────────────────────────────────────────────────
        let resolvedHtml = activeVersion.content || '';
        for (const [k, v] of Object.entries(context.placeholders)) {
          resolvedHtml = resolvedHtml.replaceAll(
            `{{${k}}}`,
            escapeHtml(String(v ?? '')),
          );
        }

        // Upload Primary HTML
        const primaryFileName = StoragePathBuilder.buildGeneratedDocumentPath(
          document.companyId,
          document.entityId,
          document.businessId,
          'html',
        );

        let primaryStorageResult;
        try {
          primaryStorageResult = await this.storageService.upload(
            primaryFileName,
            Buffer.from(resolvedHtml, 'utf-8'),
            'text/html',
          );
        } catch (e: any) {
          throw new StorageException(
            `Primary HTML document upload failed: ${e.message}`,
          );
        }

        // Render genuine PDF from resolved HTML
        let pdfBuffer: Buffer;
        try {
          pdfBuffer = await this.pdfGenerationService.generateFromHtml(
            resolvedHtml,
          );
        } catch (e: any) {
          throw new PdfConversionException(e.message);
        }

        // Upload PDF Document
        const pdfFileName = StoragePathBuilder.buildGeneratedDocumentPath(
          document.companyId,
          document.entityId,
          document.businessId,
          'pdf',
        );

        let pdfStorageResult;
        try {
          pdfStorageResult = await this.storageService.upload(
            pdfFileName,
            pdfBuffer,
            'application/pdf',
          );
        } catch (e: any) {
          throw new StorageException(
            `PDF document upload failed: ${e.message}`,
          );
        }

        primarySnapshot = this.snapshotBuilder.buildSnapshot({
          documentId: document.id.toValue() as string,
          storageResult: primaryStorageResult,
          mimeType: 'text/html',
          storageProvider: this.storageService.constructor.name,
          performedBy,
          filePath: primaryFileName,
        });

        pdfSnapshot = this.snapshotBuilder.buildSnapshot({
          documentId: document.id.toValue() as string,
          storageResult: pdfStorageResult,
          mimeType: 'application/pdf',
          storageProvider: this.storageService.constructor.name,
          performedBy,
          filePath: pdfFileName,
        });
      } else {
        // ── DOCX Pipeline ────────────────────────────────────────────────
        if (!activeVersion.storageUri) {
          throw new RenderingException('Template version has no storage URI');
        }
        const templateStream = await this.templateLoader.loadTemplateStream(
          activeVersion.storageUri,
        );

        const strategy = this.generatorFactory.getStrategy(
          activeVersion.contentType,
        );
        const renderResult = await strategy.generate(templateStream, context);

        // Upload Primary DOCX
        const primaryFileName = StoragePathBuilder.buildGeneratedDocumentPath(
          document.companyId,
          document.entityId,
          document.businessId,
          renderResult.extension.replace('.', ''),
        );

        let primaryStorageResult;
        try {
          primaryStorageResult = await this.storageService.uploadStream(
            primaryFileName,
            renderResult.stream,
            renderResult.mimeType,
          );
        } catch (e: any) {
          throw new StorageException(
            `Primary DOCX document upload failed: ${e.message}`,
          );
        }

        // Convert DOCX -> HTML -> Genuine PDF
        let pdfBuffer: Buffer;
        try {
          const docxBuffer = await this.storageService.download(
            primaryStorageResult.uri,
          );
          const htmlResult = await this.htmlConverter.convertDocxToHtml(
            docxBuffer,
          );
          pdfBuffer = await this.pdfGenerationService.generateFromHtml(
            htmlResult.html,
          );
        } catch (e: any) {
          throw new PdfConversionException(e.message);
        }

        // Upload PDF Document
        const pdfFileName = StoragePathBuilder.buildGeneratedDocumentPath(
          document.companyId,
          document.entityId,
          document.businessId,
          'pdf',
        );

        let pdfStorageResult;
        try {
          pdfStorageResult = await this.storageService.upload(
            pdfFileName,
            pdfBuffer,
            'application/pdf',
          );
        } catch (e: any) {
          throw new StorageException(
            `PDF document upload failed: ${e.message}`,
          );
        }

        primarySnapshot = this.snapshotBuilder.buildSnapshot({
          documentId: document.id.toValue() as string,
          storageResult: primaryStorageResult,
          mimeType: renderResult.mimeType,
          storageProvider: this.storageService.constructor.name,
          performedBy,
          filePath: primaryFileName,
        });

        pdfSnapshot = this.snapshotBuilder.buildSnapshot({
          documentId: document.id.toValue() as string,
          storageResult: pdfStorageResult,
          mimeType: 'application/pdf',
          storageProvider: this.storageService.constructor.name,
          performedBy,
          filePath: pdfFileName,
        });
      }

      // 4. Transition to GENERATED and attach snapshots
      const renderTimeMs = Date.now() - startTime;
      document.markAsGenerated(performedBy, [primarySnapshot, pdfSnapshot]);

      await this.unitOfWork.withTransaction(async () => {
        await this.documentRepo.save(document);
      });

      // 5. Publish Completed Event
      this.eventBus.publish(
        new DocumentGenerationCompletedEvent(
          document.id.toValue() as string,
          document.businessId,
          document.companyId,
          template.id.toValue() as string,
          document.profileId,
          [primarySnapshot.fileUrl as string, pdfSnapshot.fileUrl as string],
          renderTimeMs,
          performedBy,
        ),
      );

      return [primarySnapshot, pdfSnapshot];
    } catch (error: any) {
      document.fail(performedBy);

      try {
        await this.unitOfWork.withTransaction(async () => {
          await this.documentRepo.save(document);
        });
      } catch (saveError) {
        this.logger.error(`Failed to save document error state: ${saveError}`);
      }

      this.eventBus.publish(
        new DocumentGenerationFailedEvent(
          document.id.toValue() as string,
          document.businessId,
          document.companyId,
          template.id.toValue() as string,
          error.message,
          performedBy,
        ),
      );

      throw error;
    }
  }
}
