import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { DocumentTypeEntity } from '../../domain/entities/DocumentTypeEntity';
import { IDocumentTypeRepository } from '../../domain/repositories/IDocumentTypeRepository';
import { DocumentTypeMapper } from '../mappers/DocumentTypeMapper';

@Injectable()
export class PrismaDocumentTypeRepository
  extends PrismaRepository<DocumentTypeEntity, any>
  implements IDocumentTypeRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new DocumentTypeMapper());
  }

  protected get delegate(): any {
    return this.client.documentType;
  }

  async findByCode(
    companyId: string,
    code: string,
  ): Promise<DocumentTypeEntity | null> {
    const record = await this.delegate.findUnique({
      where: { companyId_code: { companyId, code } },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findByBusinessId(
    businessId: string,
  ): Promise<DocumentTypeEntity | null> {
    const record = await this.delegate.findUnique({
      where: { businessId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}
