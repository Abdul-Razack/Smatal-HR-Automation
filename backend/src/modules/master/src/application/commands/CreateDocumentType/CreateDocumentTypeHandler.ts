import { BaseCommandHandler } from '../../../../../../kernel/application/handlers/BaseCommandHandler';
import { CreateDocumentTypeCommand } from './CreateDocumentTypeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { Inject, Injectable } from '@nestjs/common';
import { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { DocumentTypeEntity } from '../../../domain/entities/DocumentTypeEntity';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { DomainException } from '../../../../../../kernel/domain/DomainException';
import { ErrorCode } from '@smatal/shared';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';

@Injectable()
export class CreateDocumentTypeHandler extends BaseCommandHandler<
  CreateDocumentTypeCommand,
  string
> {
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly documentTypeRepository: IDocumentTypeRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly businessIdGenerator: IBusinessIdGenerator,
  ) {
    super();
  }

  async handle(command: CreateDocumentTypeCommand): Promise<Result<string>> {
    try {
      const existing = await this.documentTypeRepository.findByCode(
        command.companyId,
        command.code,
      );
      if (existing && !existing.isDeleted) {
        throw new DomainException(
          `Document type with code ${command.code} already exists`,
          ErrorCode.CONFLICT,
        );
      }

      const businessId = await this.businessIdGenerator.generate('DOC');

      const entity = DocumentTypeEntity.create(
        {
          companyId: new Identifier<string>(command.companyId),
          businessId,
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
        },
        new Identifier<string>(crypto.randomUUID()),
      );

      await this.unitOfWork.withTransaction(async () => {
        await this.documentTypeRepository.save(entity);
      });

      return Result.ok(entity.id.toString());
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
