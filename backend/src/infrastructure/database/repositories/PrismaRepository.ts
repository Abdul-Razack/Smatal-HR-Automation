import {
  IRepository,
  IFilterOptions,
  ISortOptions,
  IPaginationOptions,
  IPaginatedResult,
} from '../../../kernel/repositories/repository.contracts';
import { Mapper } from '../../../kernel/mapping/mapping.contracts';
import { PrismaUnitOfWork } from '../transaction/PrismaUnitOfWork';
import { PrismaService } from '../prisma.service';

/**
 * Production-grade Prisma Repository.
 * Supports: pagination, sorting, filtering, optimistic locking, soft delete, business ID lookup.
 */
export abstract class PrismaRepository<
  TDomainEntity,
  TPersistenceModel,
> implements IRepository<TDomainEntity> {
  constructor(
    protected readonly uow: PrismaUnitOfWork,
    protected readonly prisma: PrismaService,
    protected readonly mapper: Mapper<TDomainEntity, any, TPersistenceModel>,
  ) {}

  protected get client(): any {
    const tx = this.uow.getTransactionContext();
    return tx ? tx : this.prisma;
  }

  protected abstract get delegate(): any;

  // ─── READ ────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<TDomainEntity | null> {
    const record = await this.delegate.findUnique({
      where: { id, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findByBusinessId(businessId: string): Promise<TDomainEntity | null> {
    const record = await this.delegate.findFirst({
      where: { businessId, isDeleted: false },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findAll(filter?: IFilterOptions): Promise<TDomainEntity[]> {
    const where = this.buildWhere(filter);
    const records = await this.delegate.findMany({ where });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async findWhere(filter: IFilterOptions): Promise<TDomainEntity[]> {
    const where = this.buildWhere(filter);
    const records = await this.delegate.findMany({ where });
    return records.map((r: any) => this.mapper.toDomain(r));
  }

  async findOnePaginated(
    filter?: IFilterOptions,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<TDomainEntity>> {
    const where = this.buildWhere(filter);
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

  async exists(filter: IFilterOptions): Promise<boolean> {
    const where = this.buildWhere(filter);
    const count = await this.delegate.count({ where });
    return count > 0;
  }

  async count(filter?: IFilterOptions): Promise<number> {
    const where = this.buildWhere(filter);
    return this.delegate.count({ where });
  }

  // ─── WRITE ───────────────────────────────────────────────────────────────

  async save(entity: TDomainEntity): Promise<void> {
    const data = this.mapper.toPersistence(entity) as any;

    if (data.id) {
      const existing = await this.delegate.findUnique({
        where: { id: data.id },
        select: { id: true, version: true },
      });

      if (existing) {
        // Optimistic concurrency: version must match
        if (existing.version !== undefined && data.version !== undefined) {
          await this.delegate.update({
            where: { id: data.id, version: existing.version },
            data: { ...data, version: { increment: 1 } },
          });
        } else {
          await this.delegate.update({ where: { id: data.id }, data });
        }
        return;
      }
    }

    await this.delegate.create({ data });
  }

  async saveMany(entities: TDomainEntity[]): Promise<void> {
    for (const entity of entities) {
      await this.save(entity);
    }
  }

  async delete(entity: TDomainEntity): Promise<void> {
    const data = this.mapper.toPersistence(entity) as any;
    if ('isDeleted' in data) {
      await this.softDelete(data.id, data.deletedBy ?? 'system');
    } else {
      await this.delegate.delete({ where: { id: data.id } });
    }
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.delegate.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
        updatedBy: deletedBy,
      },
    });
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  protected buildWhere(filter?: IFilterOptions): Record<string, any> {
    const base: Record<string, any> = { isDeleted: false };
    if (!filter) return base;

    // Handle company isolation automatically
    const { companyId, ...rest } = filter;
    if (companyId) base.companyId = companyId;

    return { ...base, ...rest };
  }
}
