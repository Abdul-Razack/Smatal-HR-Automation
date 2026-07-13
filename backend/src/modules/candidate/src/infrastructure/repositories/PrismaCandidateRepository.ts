import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { CandidateAggregate } from '../../domain/aggregates/CandidateAggregate';
import { ICandidateRepository } from '../../domain/repositories/ICandidateRepository';
import { CandidateStatus } from '../../domain/enums/CandidateStatus';
import { CandidateMapper } from '../mappers/CandidateMapper';
import {
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';

@Injectable()
export class PrismaCandidateRepository
  extends PrismaRepository<CandidateAggregate, any>
  implements ICandidateRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: CandidateMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.candidate;
  }

  async findByProfileAndCompany(
    profileId: string,
    companyId: string,
  ): Promise<CandidateAggregate | null> {
    const record = await this.delegate.findFirst({
      where: { profileId, companyId, isDeleted: false },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async listByCompany(
    companyId: string,
    status?: CandidateStatus,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<CandidateAggregate>> {
    const where: any = { companyId, isDeleted: false };
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

  async existsByProfileAndCompany(
    profileId: string,
    companyId: string,
  ): Promise<boolean> {
    const count = await this.delegate.count({
      where: { profileId, companyId, isDeleted: false },
    });
    return count > 0;
  }
}
