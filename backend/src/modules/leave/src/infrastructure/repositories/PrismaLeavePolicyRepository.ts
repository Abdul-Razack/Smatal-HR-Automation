import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { LeavePolicy } from '../../domain/entities/LeavePolicy';
import { ILeavePolicyRepository } from '../../domain/repositories/ILeavePolicyRepository';
import { LeavePolicyMapper } from '../mappers/LeavePolicyMapper';

@Injectable()
export class PrismaLeavePolicyRepository
  extends PrismaRepository<LeavePolicy, any>
  implements ILeavePolicyRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: LeavePolicyMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.leavePolicy;
  }

  async findByCompanyId(companyId: string): Promise<LeavePolicy[]> {
    const records = await this.delegate.findMany({
      where: { companyId, isDeleted: false },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async findByLeaveTypeId(leaveTypeId: string): Promise<LeavePolicy | null> {
    const record = await this.delegate.findFirst({
      where: { leaveTypeId, isDeleted: false },
    });
    return record ? this.mapper.toDomain(record) : null;
  }
}
