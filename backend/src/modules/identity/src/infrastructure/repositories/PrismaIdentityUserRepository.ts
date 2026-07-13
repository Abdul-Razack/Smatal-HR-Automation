import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { IdentityUserAggregate } from '../../domain/entities/IdentityUserAggregate';
import { IIdentityUserRepository } from '../../domain/repositories/IIdentityUserRepository';
import { IdentityUserMapper } from '../mappers/IdentityUserMapper';

@Injectable()
export class PrismaIdentityUserRepository
  extends PrismaRepository<IdentityUserAggregate, any>
  implements IIdentityUserRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new IdentityUserMapper());
  }

  protected get delegate(): any {
    return this.client.identityUser;
  }

  async findById(id: string): Promise<IdentityUserAggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id, isDeleted: false },
      include: { profile: true },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findByEmail(
    email: string,
    companyId: string,
  ): Promise<IdentityUserAggregate | null> {
    const record = await this.delegate.findFirst({
      where: { email, companyId, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findActiveByCompany(
    companyId: string,
  ): Promise<IdentityUserAggregate[]> {
    const records = await this.delegate.findMany({
      where: { companyId, isActive: true, isDeleted: false },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }
}
