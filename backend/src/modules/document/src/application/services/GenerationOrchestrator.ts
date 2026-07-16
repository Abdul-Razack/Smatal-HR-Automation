import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { DocumentGeneratorFactory } from '../../infrastructure/generators/DocumentGeneratorFactory';
import { IStorageService } from '../../../../../infrastructure/storage/IStorageService';
import { PdfConverterService } from '../../infrastructure/services/PdfConverterService';
import { TemplateLoader } from '../../infrastructure/services/TemplateLoader';
import { DocumentSnapshotBuilder } from '../../domain/builders/DocumentSnapshotBuilder';
import { StoragePathBuilder } from '../../../../../infrastructure/storage/StoragePathBuilder';
import { GeneratedDocumentAggregate } from '../../domain/aggregates/GeneratedDocumentAggregate';
import { TemplateAggregate } from '../../domain/aggregates/TemplateAggregate';
import { TemplateVersionEntity } from '../../domain/entities/TemplateVersionEntity';
import { DocumentRenderContext } from '../../domain/models/DocumentRenderContext';
import { GenerationValidator } from '../../domain/services/GenerationValidator';
import { DocumentSnapshotVO } from '../../domain/value-objects/DocumentSnapshotVO';
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

@Injectable()
export class GenerationOrchestrator {
  private readonly logger = new Logger(GenerationOrchestrator.name);

  constructor(
    private readonly validator: GenerationValidator,
    private readonly generatorFactory: DocumentGeneratorFactory,
    private readonly templateLoader: TemplateLoader,
    private readonly pdfConverter: PdfConverterService,
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
      // 2. Validate
      this.validator.validatePreRender(
        document,
        template,
        activeVersion,
        context,
      );

      // 3. Load Template
      if (!activeVersion.storageUri) {
        throw new RenderingException('Template version has no storage URI');
      }
      const templateStream = await this.templateLoader.loadTemplateStream(
        activeVersion.storageUri,
      );

      // 4. Get Strategy and Render
      const strategy = this.generatorFactory.getStrategy(
        activeVersion.contentType,
      );
      const startTime = Date.now();
      const renderResult = await strategy.generate(templateStream, context);
      const renderTimeMs = Date.now() - startTime;

      this.logger.debug(`Rendered document in ${renderTimeMs}ms`);

      // 5. Upload Primary Document
      const primaryFileName = StoragePathBuilder.buildGeneratedDocumentPath(
        document.companyId,
        document.employeeId,
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
          `Primary document upload failed: ${e.message}`,
        );
      }

      // 6. PDF Conversion
      let pdfBuffer: Buffer;
      try {
        // We have to download the stream we just uploaded to convert it, since the original stream was consumed.
        const uploadedBuffer = await this.storageService.download(
          primaryStorageResult.uri,
        );
        pdfBuffer = await this.pdfConverter.convertToPdf(
          uploadedBuffer,
          activeVersion.contentType,
        );
      } catch (e: any) {
        throw new PdfConversionException(e.message);
      }

      // 7. Upload PDF
      const pdfFileName = StoragePathBuilder.buildGeneratedDocumentPath(
        document.companyId,
        document.employeeId,
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
        throw new StorageException(`PDF document upload failed: ${e.message}`);
      }

      // 8. Build Snapshots
      const primarySnapshot = this.snapshotBuilder.buildSnapshot({
        documentId: document.id.toValue() as string,
        storageResult: primaryStorageResult,
        mimeType: renderResult.mimeType,
        storageProvider: this.storageService.constructor.name,
        performedBy,
        filePath: primaryFileName,
        renderedContent:
          activeVersion.contentType === 'html' ? undefined : undefined, // V2 does not store rendered content in DB
      });

      const pdfSnapshot = this.snapshotBuilder.buildSnapshot({
        documentId: document.id.toValue() as string,
        storageResult: pdfStorageResult,
        mimeType: 'application/pdf',
        storageProvider: this.storageService.constructor.name,
        performedBy,
        filePath: pdfFileName,
      });

      // 9. Transition to GENERATED and attach snapshots
      document.markAsGenerated(performedBy, [primarySnapshot, pdfSnapshot]);

      await this.unitOfWork.withTransaction(async () => {
        await this.documentRepo.save(document);
      });

      // 10. Publish Completed Event
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
