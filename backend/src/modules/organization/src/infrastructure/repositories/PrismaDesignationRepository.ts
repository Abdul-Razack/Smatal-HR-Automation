import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { DesignationEntity } from '../../domain/entities/DesignationEntity';
import { IDesignationRepository } from '../../domain/repositories/IDesignationRepository';
import { DesignationMapper } from '../mappers/OrganizationMappers';

@Injectable()
export class PrismaDesignationRepository
  extends PrismaRepository<DesignationEntity, any>
  implements IDesignationRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new DesignationMapper());
  }

  protected get delegate(): any {
    return this.client.designation;
  }

  async findByCode(
    code: string,
    companyId: string,
  ): Promise<DesignationEntity | null> {
    const record = await this.delegate.findFirst({
      where: { code, companyId, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }
}
