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
import { FieldRuntimeService } from '../../../../../master/src/runtime/FieldRuntimeService';
import { DocumentGeneratorService } from '../../../infrastructure/services/DocumentGeneratorService';

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
    private readonly fieldRegistry: FieldRuntimeService,
    private readonly documentGenerator: DocumentGeneratorService,
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

      // Resolve placeholders to field values
      const placeholders = activeVersion.placeholders.map((p) => ({
        fieldDefinitionId: p.fieldDefinitionId,
        placeholderKey: p.placeholderKey,
        isRequired: p.isRequired,
      }));

      const resolvedValues =
        await this.fieldRegistry.resolveDocumentPlaceholders(
          command.companyId,
          command.profileId,
          placeholders,
          command.candidateId,
          command.employeeId,
        );

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

      // Compile HTML from template + resolved fields
      const compiledHtml = await this.documentGenerator.compileHtml(
        activeVersion,
        resolvedValues,
      );
      // Generate PDF and create immutable snapshot
      const snapshot = await this.documentGenerator.generatePdfSnapshot(
        document,
        compiledHtml,
        command.performedBy,
      );

      // Transition to GENERATED and attach snapshot
      document.markAsGenerated(command.performedBy, snapshot);

      await this.unitOfWork.withTransaction(async () => {
        await this.documentRepo.save(document);
      });

      return Result.ok<string>(document.id.toValue() as string);
    } catch (error: any) {
      this.logger.error(`Document generation failed: ${error.message}`);
      return Result.fail<string>(error.message);
    }
  }
}
