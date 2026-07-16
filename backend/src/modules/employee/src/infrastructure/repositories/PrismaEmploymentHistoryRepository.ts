import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { EmploymentHistoryEntity } from '../../domain/entities/EmploymentHistoryEntity';
import { IEmploymentHistoryRepository } from '../../domain/repositories/IEmploymentHistoryRepository';
import { EmploymentHistoryMapper } from '../mappers/EmploymentHistoryMapper';

@Injectable()
export class PrismaEmploymentHistoryRepository
  extends PrismaRepository<EmploymentHistoryEntity, any>
  implements IEmploymentHistoryRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: EmploymentHistoryMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.employmentHistory;
  }

  async findByEmployee(
    employeeId: string,
    companyId: string,
  ): Promise<EmploymentHistoryEntity[]> {
    const records = await this.delegate.findMany({
      where: { employeeId, companyId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }
}
