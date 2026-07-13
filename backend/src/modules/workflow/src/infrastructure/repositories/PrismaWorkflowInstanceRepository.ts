import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { WorkflowInstanceAggregate } from '../../domain/aggregates/WorkflowInstanceAggregate';
import { WorkflowHistoryEntity } from '../../domain/entities/WorkflowHistoryEntity';
import { IWorkflowInstanceRepository } from '../../domain/repositories/IWorkflowInstanceRepository';
import { WorkflowInstanceStatus } from '../../domain/enums/WorkflowEnums';
import { WorkflowInstanceMapper } from '../mappers/WorkflowInstanceMapper';
import {
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';

@Injectable()
export class PrismaWorkflowInstanceRepository
  extends PrismaRepository<WorkflowInstanceAggregate, any>
  implements IWorkflowInstanceRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: WorkflowInstanceMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.workflowInstance;
  }

  private get historyDelegate(): any {
    return this.client.workflowHistory;
  }

  async findById(id: string): Promise<WorkflowInstanceAggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id, isDeleted: false },
      include: {
        workflowDefinition: {
          include: { stages: { orderBy: { displayOrder: 'asc' } } },
        },
      },
    });
    if (!record) return null;

    // Enrich with definitionStageIds for return-validation
    const row = {
      ...record,
      definitionStageIds:
        record.workflowDefinition?.stages?.map((s: any) => s.id) ?? [],
    };
    return (this.mapper as WorkflowInstanceMapper).toDomain(row);
  }

  async findByEntityAndCompany(
    entityId: string,
    companyId: string,
  ): Promise<WorkflowInstanceAggregate[]> {
    const records = await this.delegate.findMany({
      where: { entityId, companyId, isDeleted: false },
    });
    return records.map((r: any) =>
      (this.mapper as WorkflowInstanceMapper).toDomain({
        ...r,
        definitionStageIds: [],
      }),
    );
  }

  async findActiveByEntityAndCompany(
    entityId: string,
    companyId: string,
  ): Promise<WorkflowInstanceAggregate | null> {
    const record = await this.delegate.findFirst({
      where: {
        entityId,
        companyId,
        isDeleted: false,
        status: {
          in: [
            WorkflowInstanceStatus.PENDING,
            WorkflowInstanceStatus.IN_PROGRESS,
          ],
        },
      },
      include: {
        workflowDefinition: {
          include: { stages: { orderBy: { displayOrder: 'asc' } } },
        },
      },
    });
    if (!record) return null;
    const row = {
      ...record,
      definitionStageIds:
        record.workflowDefinition?.stages?.map((s: any) => s.id) ?? [],
    };
    return (this.mapper as WorkflowInstanceMapper).toDomain(row);
  }

  async listByCompany(
    companyId: string,
    status?: WorkflowInstanceStatus,
    entityType?: string,
    entityId?: string,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<WorkflowInstanceAggregate>> {
    const where: any = { companyId, isDeleted: false };
    if (status) where.status = status;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

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
      data: records.map((r: any) =>
        (this.mapper as WorkflowInstanceMapper).toDomain({
          ...r,
          definitionStageIds: [],
        }),
      ),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async saveHistory(entries: WorkflowHistoryEntity[]): Promise<void> {
    if (entries.length === 0) return;
    const instMapper = this.mapper as WorkflowInstanceMapper;
    const data = entries.map((e) => instMapper.historyToPersistence(e));
    await this.historyDelegate.createMany({ data, skipDuplicates: true });
  }

  async findHistoryByInstance(
    instanceId: string,
  ): Promise<WorkflowHistoryEntity[]> {
    const records = await this.historyDelegate.findMany({
      where: { workflowInstanceId: instanceId },
      orderBy: { performedAt: 'asc' },
    });
    const instMapper = this.mapper as WorkflowInstanceMapper;
    return records.map((r: any) => instMapper.historyToDomain(r));
  }
}
