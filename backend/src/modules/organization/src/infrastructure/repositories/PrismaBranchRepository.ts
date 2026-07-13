import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { BranchEntity } from '../../domain/entities/BranchEntity';
import { IBranchRepository } from '../../domain/repositories/IBranchRepository';
import { BranchMapper } from '../mappers/OrganizationMappers';

@Injectable()
export class PrismaBranchRepository
  extends PrismaRepository<BranchEntity, any>
  implements IBranchRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new BranchMapper());
  }

  protected get delegate(): any {
    return this.client.branch;
  }

  async findByCode(
    code: string,
    companyId: string,
  ): Promise<BranchEntity | null> {
    const record = await this.delegate.findFirst({
      where: { code, companyId, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findHeadquarters(companyId: string): Promise<BranchEntity | null> {
    const record = await this.delegate.findFirst({
      where: { companyId, isHeadquarters: true, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
