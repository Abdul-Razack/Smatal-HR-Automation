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
import { AutomaticResolverService } from '../../../domain/services/AutomaticResolverService';
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
    private readonly automaticResolver: AutomaticResolverService,
    private readonly dispatcher: ImmediateDispatcher,
    private readonly dataProvider: PrismaEntityDataProvider,
  ) {}

  async execute(command: GenerateDocumentCommand): Promise<Result<string>> {
    try {
      const template = await this.templateRepo.findById(command.templateId);
      if (!template) {
        return Result.fail<string>(`Template not found: ${command.templateId}`);
      }
      if (template.companyId !== command.companyId) {
        return Result.fail<string>(
          `Unauthorized to access template ${command.templateId}`,
        );
      }

      this.domainService.validateTemplateForGeneration(template);
      const activeVersion = template.getActiveVersion();
      if (!activeVersion) {
        return Result.fail<string>(
          `No active version found for template ${command.templateId}`,
        );
      }

      // Resolve placeholders automatically
      const keys = activeVersion.placeholders.map((p) => p.placeholderKey);

      const result = await this.automaticResolver.resolvePlaceholders(
        keys,
        {
          companyId: command.companyId,
          profileId: command.profileId,
          candidateId: command.candidateId,
          employeeId: command.employeeId,
          userId: command.performedBy,
        },
        this.dataProvider
      );

      if (result.errors.length > 0) {
        throw new Error(`Cannot generate document: ${result.errors.join(', ')}`);
      }

      const resolvedValues = result.resolvedValues;

      // Create Document aggregate (GENERATING state)
      const businessId = await this.idGenerator.generate('GDOC');
      const document = GeneratedDocumentAggregate.create({
        businessId,
        companyId: command.companyId,
        profileId: command.profileId,
        documentTypeId: template.documentTypeId,
        templateVersionId: activeVersion.id.toValue() as string,
        workflowInstanceId: command.workflowInstanceId,
        workflowStageId: command.workflowStageId,
        candidateId: command.candidateId,
        employeeId: command.employeeId,
        status: DocumentGenerationStatus.GENERATING,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: command.performedBy,
        updatedBy: command.performedBy,
        snapshots: [],
      });

      // Save initial GENERATING state
      await this.unitOfWork.withTransaction(async () => {
        await this.documentRepo.save(document);
      });

      // Construct context
      const context = {
        tenantId: command.companyId, // Assuming 1-to-1 for now
        companyId: command.companyId,
        profileId: command.profileId,
        employeeId: command.employeeId,
        candidateId: command.candidateId,
        workflowInstanceId: command.workflowInstanceId,
        placeholders: resolvedValues,
        locale: 'en-US',
        timezone: 'UTC',
        currency: 'USD',
        generatedDate: new Date(),
        metadata: {},
      };

      // Dispatch generation job (Sync for now)
      await this.dispatcher.dispatch({
        document,
        template,
        activeVersion,
        context,
        performedBy: command.performedBy,
      });

      return Result.ok<string>(document.id.toValue() as string);
    } catch (error: any) {
      this.logger.error(`Document generation failed: ${error.message}`);
      return Result.fail<string>(error.message);
    }
  }
}
