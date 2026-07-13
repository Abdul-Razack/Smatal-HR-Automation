import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { FieldGroupEntity } from '../../domain/entities/FieldGroupEntity';
import { IFieldGroupRepository } from '../../domain/repositories/IFieldGroupRepository';
import { FieldGroupMapper } from '../mappers/FieldGroupMapper';

@Injectable()
export class PrismaFieldGroupRepository
  extends PrismaRepository<FieldGroupEntity, any>
  implements IFieldGroupRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new FieldGroupMapper());
  }

  protected get delegate(): any {
    return this.client.fieldGroup;
  }

  async findByName(
    companyId: string,
    name: string,
  ): Promise<FieldGroupEntity | null> {
    const records = await this.delegate.findMany({
      where: { companyId, name },
      take: 1,
    });
    return records.length > 0 ? this.mapper.toDomain(records[0]) : null;
  }
}
