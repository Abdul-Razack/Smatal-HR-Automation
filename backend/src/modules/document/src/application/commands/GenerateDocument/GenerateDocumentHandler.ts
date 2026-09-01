import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateDocumentCommand } from './GenerateDocumentCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { IGeneratedDocumentRepository } from '../../../domain/repositories/IGeneratedDocumentRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { DocumentDomainService } from '../../../domain/services/DocumentDomainService';
import { GeneratedDocumentAggregate } from '../../../domain/aggregates/GeneratedDocumentAggregate';
import { DocumentGenerationStatus } from '../../../domain/enums/DocumentEnums';
import { ImmediateDispatcher } from '../../dispatchers/ImmediateDispatcher';
import { PrismaEntityDataProvider } from '../../../infrastructure/data/PrismaEntityDataProvider';

@CommandHandler(GenerateDocumentCommand)
@Injectable()
export class GenerateDocumentHandler implements ICommandHandler<GenerateDocumentCommand> {
  private readonly logger = new Logger(GenerateDocumentHandler.name);

  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepo: ITemplateRepository,
    @Inject('IGeneratedDocumentRepository')
    private readonly documentRepo: IGeneratedDocumentRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
    private readonly domainService: DocumentDomainService,
    private readonly dispatcher: ImmediateDispatcher,
    private readonly dataProvider: PrismaEntityDataProvider,
  ) {}

  async execute(command: GenerateDocumentCommand): Promise<Result<string>> {
    try {
      // Find the active template by DocumentTypeId
      const templates = await this.templateRepo.findByDocumentTypeId(command.documentTypeId);
      const activeTemplate = templates.find((t) => t.status === 'PUBLISHED' || t.status === 'DRAFT'); // Fallback to DRAFT if no published for MVP
      
      if (!activeTemplate) {
        return Result.fail<string>(`No active template found for DocumentType: ${command.documentTypeId}`);
      }

      this.domainService.validateTemplateForGeneration(activeTemplate);
      const activeVersion = activeTemplate.getActiveVersion();
      if (!activeVersion) {
        return Result.fail<string>(
          `No active version found for template ${activeTemplate.id.toString()}`,
        );
      }

      // Create Document aggregate (QUEUED state)
      const businessId = await this.idGenerator.generate('GDOC');
      const document = GeneratedDocumentAggregate.create({
        businessId,
        companyId: command.companyId,
        profileId: command.performedBy, // Profile is just a placeholder here in new design
        documentTypeId: command.documentTypeId,
        templateVersionId: activeVersion.id.toValue() as string,
        workflowInstanceId: command.context.workflowId,
        entityType: command.entityType,
        entityId: command.entityId,
        status: DocumentGenerationStatus.QUEUED as any,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: command.performedBy,
        updatedBy: command.performedBy,
        snapshots: [],
      });

      // Save initial QUEUED state
      await this.unitOfWork.withTransaction(async () => {
        await this.documentRepo.save(document);
      });

      // Pass context for async dispatcher
      const context = {
        tenantId: command.companyId,
        companyId: command.companyId,
        profileId: command.performedBy,
        entityType: command.entityType,
        entityId: command.entityId,
        workflowInstanceId: command.context.workflowId,
        actionId: command.context.actionId,
        placeholders: {}, // Resolved later asynchronously
        locale: 'en-US',
        timezone: 'UTC',
        currency: 'USD',
        generatedDate: new Date(),
        metadata: {},
      };

      // Dispatch generation job to process in the background
      await this.dispatcher.dispatch({
        document,
        template: activeTemplate,
        activeVersion,
        context,
        performedBy: command.performedBy,
      });

      return Result.ok<string>(document.id.toValue() as string);
    } catch (error: any) {
      this.logger.error(`Document generation queue failed: ${error.message}`);
      return Result.fail<string>(error.message);
    }
  }
}
