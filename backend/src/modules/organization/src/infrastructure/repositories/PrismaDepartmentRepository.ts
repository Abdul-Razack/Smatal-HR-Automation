import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { DepartmentEntity } from '../../domain/entities/DepartmentEntity';
import { IDepartmentRepository } from '../../domain/repositories/IDepartmentRepository';
import { DepartmentMapper } from '../mappers/OrganizationMappers';

@Injectable()
export class PrismaDepartmentRepository
  extends PrismaRepository<DepartmentEntity, any>
  implements IDepartmentRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new DepartmentMapper());
  }

  protected get delegate(): any {
    return this.client.department;
  }

  async findByCode(
    code: string,
    companyId: string,
  ): Promise<DepartmentEntity | null> {
    const record = await this.delegate.findFirst({
      where: { code, companyId, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findByParentId(
    parentId: string,
    companyId: string,
  ): Promise<DepartmentEntity[]> {
    const records = await this.delegate.findMany({
      where: { parentId, companyId, isDeleted: false },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }
}
