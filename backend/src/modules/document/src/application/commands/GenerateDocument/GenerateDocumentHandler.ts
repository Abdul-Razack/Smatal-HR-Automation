import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateDocumentCommand } from './GenerateDocumentCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { IGeneratedDocumentRepository } from '../../../domain/repositories/IGeneratedDocumentRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { DocumentDomainService } from '../../../domain/services/DocumentDomainService';
import { GeneratedDocumentAggregate } from '../../../domain/aggregates/GeneratedDocumentAggregate';
import { DocumentGenerationStatus } from '../../../domain/enums/DocumentEnums';
import { ImmediateDispatcher } from '../../dispatchers/ImmediateDispatcher';
import { PrismaEntityDataProvider } from '../../../infrastructure/data/PrismaEntityDataProvider';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@CommandHandler(GenerateDocumentCommand)
@Injectable()
export class GenerateDocumentHandler implements ICommandHandler<GenerateDocumentCommand> {
  private readonly logger = new Logger(GenerateDocumentHandler.name);

  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly docTypeRepo: IDocumentTypeRepository,
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
    private readonly prisma?: PrismaService,
  ) {}

  async execute(command: GenerateDocumentCommand): Promise<Result<string>> {
    try {
      // 1. Validate DocumentType exists, belongs to tenant, and is active
      const docType = await this.docTypeRepo.findById(command.documentTypeId);
      if (!docType || docType.isDeleted || docType.companyId !== command.companyId) {
        return Result.fail<string>('Document type not found');
      }
      if (!docType.isActive) {
        return Result.fail<string>('Cannot generate document: document type is inactive.');
      }

      // 2. Validate Entity (Employee / Candidate) belongs to tenant
      let resolvedProfileId = command.performedBy;
      let entityBranch: { name?: string; code?: string } | null = null;
      if (this.prisma) {
        if (command.entityType === 'EMPLOYEE' && command.entityId) {
          const employee = await this.prisma.employee.findUnique({
            where: { id: command.entityId },
            select: {
              id: true,
              profileId: true,
              companyId: true,
              isDeleted: true,
              branch: { select: { id: true, name: true, code: true } },
            },
          });
          if (!employee || employee.isDeleted || employee.companyId !== command.companyId) {
            return Result.fail<string>('Employee not found or does not belong to your company');
          }
          if (employee.profileId) {
            resolvedProfileId = employee.profileId;
          }
          if (employee.branch) {
            entityBranch = employee.branch;
          }
        } else if (command.entityType === 'CANDIDATE' && command.entityId) {
          const candidate = await this.prisma.candidate.findUnique({
            where: { id: command.entityId },
            select: { id: true, profileId: true, companyId: true, isDeleted: true },
          });
          if (!candidate || candidate.isDeleted || candidate.companyId !== command.companyId) {
            return Result.fail<string>('Candidate not found or does not belong to your company');
          }
          if (candidate.profileId) {
            resolvedProfileId = candidate.profileId;
          }
        }
      }

      // 3. Find the active template by DocumentTypeId belonging strictly to company
      const allTemplates = await this.templateRepo.findByDocumentTypeId(command.documentTypeId);
      const companyTemplates = allTemplates.filter((t) => t.companyId === command.companyId);

      let activeTemplate: any | undefined;

      // 3a. If explicit templateId was provided, match directly
      if (command.templateId) {
        activeTemplate = companyTemplates.find(
          (t) =>
            t.id.toString() === command.templateId ||
            (t.id as any).value === command.templateId,
        );
      }

      // 3b. If not explicitly matched and entity has a branch (e.g. SSS vs SCA), match by branch name or code
      if (!activeTemplate && entityBranch) {
        const branchName = entityBranch.name?.toLowerCase() || '';
        const branchCode = entityBranch.code?.toUpperCase() || '';

        activeTemplate = companyTemplates.find((t) => {
          if (t.status !== 'PUBLISHED' || !t.getActiveVersion()) return false;
          const templateName = t.name.toLowerCase();
          return (
            (branchName && templateName.includes(branchName)) ||
            (branchCode && templateName.toUpperCase().includes(branchCode))
          );
        });
      }

      // 3c. Fallback to newest published template, or draft
      if (!activeTemplate) {
        const sortedTemplates = [...companyTemplates].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        activeTemplate =
          sortedTemplates.find((t) => t.status === 'PUBLISHED' && t.getActiveVersion()) ||
          sortedTemplates.find((t) => t.status === 'PUBLISHED') ||
          sortedTemplates.find((t) => t.status === 'DRAFT');
      }
      
      if (!activeTemplate) {
        return Result.fail<string>(`No active template found for DocumentType: ${command.documentTypeId}`);
      }

      this.domainService.validateTemplateForGeneration(activeTemplate);

      // Select published version (or fallback for MVP if draft)
      const activeVersion =
        activeTemplate.getActiveVersion() ||
        (activeTemplate.versions.length > 0
          ? [...activeTemplate.versions].sort((a, b) => b.versionNumber - a.versionNumber)[0]
          : undefined);

      if (!activeVersion) {
        return Result.fail<string>(
          `No active version found for template ${activeTemplate.id.toString()}`,
        );
      }

      // 4. Create Document aggregate (QUEUED state)
      const businessId = await this.idGenerator.generate('GDOC');
      const document = GeneratedDocumentAggregate.create({
        businessId,
        companyId: command.companyId,
        profileId: resolvedProfileId,
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
        profileId: resolvedProfileId,
        entityType: command.entityType,
        entityId: command.entityId,
        workflowInstanceId: command.context.workflowId,
        actionId: command.context.actionId,
        placeholders: {}, // Resolved synchronously or asynchronously by orchestrator
        locale: 'en-US',
        timezone: 'UTC',
        currency: 'USD',
        generatedDate: new Date(),
        metadata: {},
      };

      // Dispatch generation job
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
