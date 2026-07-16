import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { LeaveRequestAggregate } from '../../domain/aggregates/LeaveRequestAggregate';
import { ILeaveRequestRepository } from '../../domain/repositories/ILeaveRequestRepository';
import { LeaveRequestMapper } from '../mappers/LeaveRequestMapper';
import {
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';
import { LeaveStatus } from '../../domain/enums/LeaveEnums';

@Injectable()
export class PrismaLeaveRequestRepository
  extends PrismaRepository<LeaveRequestAggregate, any>
  implements ILeaveRequestRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: LeaveRequestMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.leaveRequest;
  }

  async findByCompanyId(
    companyId: string,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<LeaveRequestAggregate>> {
    return this.listWithFilters(
      companyId,
      undefined,
      undefined,
      pagination,
      sort,
    );
  }

  async findByEmployeeId(
    employeeId: string,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<LeaveRequestAggregate>> {
    return this.listWithFilters(
      undefined,
      employeeId,
      undefined,
      pagination,
      sort,
    );
  }

  async findOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LeaveRequestAggregate[]> {
    const records = await this.delegate.findMany({
      where: {
        employeeId,
        isDeleted: false,
        status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
        OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
      },
    });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async listWithFilters(
    companyId?: string,
    employeeId?: string,
    status?: LeaveStatus,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<LeaveRequestAggregate>> {
    const where: any = { isDeleted: false };
    if (companyId) where.companyId = companyId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const page = pagination?.page ?? 1;
    const limit = Math.min(pagination?.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const orderBy = sort
      ? { [sort.field]: sort.direction }
      : { createdAt: 'desc' as const };

    const [records, total] = await Promise.all([
      this.delegate.findMany({ where, skip, take: limit, orderBy }),
      this.delegate.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: records.map((r: any) => this.mapper.toDomain(r)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
