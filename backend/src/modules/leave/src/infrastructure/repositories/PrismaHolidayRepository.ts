import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { Holiday } from '../../domain/entities/Holiday';
import { IHolidayRepository } from '../../domain/repositories/IHolidayRepository';
import { HolidayMapper } from '../mappers/HolidayMapper';

@Injectable()
export class PrismaHolidayRepository
  extends PrismaRepository<Holiday, any>
  implements IHolidayRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: HolidayMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.holiday;
  }

  async findByCompanyId(companyId: string, year: number): Promise<Holiday[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const records = await this.delegate.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async findByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Holiday[]> {
    const records = await this.delegate.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isDeleted: false,
      },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }
}
