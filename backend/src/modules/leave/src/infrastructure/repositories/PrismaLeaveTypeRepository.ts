import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { LeaveType } from '../../domain/entities/LeaveType';
import { ILeaveTypeRepository } from '../../domain/repositories/ILeaveTypeRepository';
import { LeaveTypeMapper } from '../mappers/LeaveTypeMapper';

@Injectable()
export class PrismaLeaveTypeRepository
  extends PrismaRepository<LeaveType, any>
  implements ILeaveTypeRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: LeaveTypeMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.leaveType;
  }

  async findByCompanyId(companyId: string): Promise<LeaveType[]> {
    const records = await this.delegate.findMany({
      where: { companyId, isDeleted: false },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async findByCode(companyId: string, code: string): Promise<LeaveType | null> {
    const record = await this.delegate.findFirst({
      where: { companyId, code, isDeleted: false },
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}
