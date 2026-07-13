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
      const businessId = await this.idGenerator.generate('DOC');

      const documentType = DocumentTypeAggregate.create({
        businessId,
        companyId: command.companyId,
        name: command.name,
        code: command.code,
        description: command.description,
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
