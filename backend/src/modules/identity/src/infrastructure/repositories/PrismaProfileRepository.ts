import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { ProfileAggregate } from '../../domain/entities/ProfileAggregate';
import { IProfileRepository } from '../../domain/repositories/IProfileRepository';
import { ProfileMapper } from '../mappers/ProfileMapper';

@Injectable()
export class PrismaProfileRepository
  extends PrismaRepository<ProfileAggregate, any>
  implements IProfileRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new ProfileMapper());
  }

  protected get delegate(): any {
    return this.client.profile;
  }

  async findByEmail(email: string): Promise<ProfileAggregate | null> {
    const record = await this.delegate.findFirst({
      where: { personalEmail: email, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
