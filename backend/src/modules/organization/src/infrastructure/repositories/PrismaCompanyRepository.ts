import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { CompanyAggregate } from '../../domain/entities/CompanyAggregate';
import { ICompanyRepository } from '../../domain/repositories/ICompanyRepository';
import { CompanyMapper } from '../mappers/OrganizationMappers';

@Injectable()
export class PrismaCompanyRepository
  extends PrismaRepository<CompanyAggregate, any>
  implements ICompanyRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new CompanyMapper());
  }

  protected get delegate(): any {
    return this.client.company;
  }

  async findByCode(code: string): Promise<CompanyAggregate | null> {
    const record = await this.delegate.findFirst({
      where: { code, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
