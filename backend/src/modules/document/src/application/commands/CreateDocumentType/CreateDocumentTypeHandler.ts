import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDocumentTypeCommand } from './CreateDocumentTypeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository';
import { DocumentTypeAggregate } from '../../../domain/aggregates/DocumentTypeAggregate';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';

@CommandHandler(CreateDocumentTypeCommand)
@Injectable()
export class CreateDocumentTypeHandler implements ICommandHandler<CreateDocumentTypeCommand> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly repository: IDocumentTypeRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
  ) {}

  async execute(command: CreateDocumentTypeCommand): Promise<Result<string>> {
    try {
      if (!command.name || !command.name.trim()) {
        return Result.fail<string>('Document type name is required.');
      }

      if (!command.code || !command.code.trim()) {
        return Result.fail<string>('Document type code is required.');
      }

      const normalizedCode = command.code.trim().toUpperCase().replace(/\s+/g, '_');

      const existing = await this.repository.findByCode(
        command.companyId,
        normalizedCode,
      );
      if (existing && !existing.isDeleted) {
        return Result.fail<string>(
          `Document type with code "${normalizedCode}" already exists in this company.`,
        );
      }

      const businessId = await this.idGenerator.generate('DOC');

      const documentType = DocumentTypeAggregate.create({
        businessId,
        companyId: command.companyId,
        name: command.name.trim(),
        code: normalizedCode,
        description: command.description?.trim() || null,
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: command.performedBy,
        updatedBy: command.performedBy,
      });

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(documentType);
      });

      return Result.ok<string>(documentType.id.toValue() as string);
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
