import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { LeaveBalance } from '../../domain/entities/LeaveBalance';
import { ILeaveBalanceRepository } from '../../domain/repositories/ILeaveBalanceRepository';
import { LeaveBalanceMapper } from '../mappers/LeaveBalanceMapper';

@Injectable()
export class PrismaLeaveBalanceRepository
  extends PrismaRepository<LeaveBalance, any>
  implements ILeaveBalanceRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: LeaveBalanceMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.leaveBalance;
  }

  async findByEmployeeId(
    employeeId: string,
    year: number,
  ): Promise<LeaveBalance[]> {
    // LeaveBalance Prisma model has no isDeleted field
    const records = await this.delegate.findMany({
      where: { employeeId, year },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async findSpecificBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveBalance | null> {
    const record = await this.delegate.findFirst({
      where: { employeeId, leaveTypeId, year },
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}
