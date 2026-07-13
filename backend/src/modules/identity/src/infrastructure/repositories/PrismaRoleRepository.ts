import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { RoleEntity } from '../../domain/entities/RoleEntity';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { RoleMapper } from '../mappers/RoleMapper';

@Injectable()
export class PrismaRoleRepository
  extends PrismaRepository<RoleEntity, any>
  implements IRoleRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new RoleMapper());
  }

  protected get delegate(): any {
    return this.client.role;
  }

  async findByCode(
    code: string,
    companyId: string,
  ): Promise<RoleEntity | null> {
    const record = await this.delegate.findFirst({
      where: { code, companyId, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findAllByCompany(companyId: string): Promise<RoleEntity[]> {
    const records = await this.delegate.findMany({
      where: { companyId, isDeleted: false },
      orderBy: { name: 'asc' },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async findSystemRoles(): Promise<RoleEntity[]> {
    const records = await this.delegate.findMany({
      where: { isSystem: true, isDeleted: false },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }
}
