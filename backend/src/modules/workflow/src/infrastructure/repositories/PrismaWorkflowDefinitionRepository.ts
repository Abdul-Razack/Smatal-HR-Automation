import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { WorkflowDefinitionAggregate } from '../../domain/aggregates/WorkflowDefinitionAggregate';
import { IWorkflowDefinitionRepository } from '../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowStatus } from '../../domain/enums/WorkflowEnums';
import { WorkflowDefinitionMapper } from '../mappers/WorkflowDefinitionMapper';
import {
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';

@Injectable()
export class PrismaWorkflowDefinitionRepository
  extends PrismaRepository<WorkflowDefinitionAggregate, any>
  implements IWorkflowDefinitionRepository
{
  constructor(
    uow: PrismaUnitOfWork,
    prisma: PrismaService,
    mapper: WorkflowDefinitionMapper,
  ) {
    super(uow, prisma, mapper);
  }

  protected get delegate(): any {
    return this.client.workflowDefinition;
  }

  private get stageDelegate(): any {
    return this.client.workflowStage;
  }

  /**
   * Override save to also upsert stages in sync.
   */
  async save(entity: WorkflowDefinitionAggregate): Promise<void> {
    const data = (this.mapper as WorkflowDefinitionMapper).toPersistence(
      entity,
    );
    const { stages, ...definitionData } = data;

    await this.delegate.upsert({
      where: { id: definitionData.id },
      create: definitionData,
      update: {
        name: definitionData.name,
        description: definitionData.description,
        entityType: definitionData.entityType,
        processCode: definitionData.processCode,
        status: definitionData.status,
        isDeleted: definitionData.isDeleted,
        deletedAt: definitionData.deletedAt,
        deletedBy: definitionData.deletedBy,
        version: definitionData.version,
        updatedAt: definitionData.updatedAt,
        updatedBy: definitionData.updatedBy,
      },
    });

    // Sync stages: delete removed, upsert existing
    const stageIds = (stages ?? []).map((s: any) => s.id);
    await this.stageDelegate.deleteMany({
      where: {
        workflowDefinitionId: definitionData.id,
        id: { notIn: stageIds },
      },
    });
    for (const stage of stages ?? []) {
      await this.stageDelegate.upsert({
        where: { id: stage.id },
        create: {
          id: stage.id,
          workflowDefinitionId: definitionData.id,
          name: stage.name,
          code: stage.code,
          description: stage.description,
          displayOrder: stage.displayOrder,
          isTerminal: stage.isTerminal,
          isFinal: stage.isFinal,
          createdAt: stage.createdAt,
          updatedAt: stage.updatedAt,
          createdBy: stage.createdBy,
          updatedBy: stage.updatedBy,
        },
        update: {
          name: stage.name,
          description: stage.description,
          displayOrder: stage.displayOrder,
          isTerminal: stage.isTerminal,
          isFinal: stage.isFinal,
          updatedAt: stage.updatedAt,
          updatedBy: stage.updatedBy,
        },
      });
    }
  }

  /**
   * Override findById to eagerly load stages.
   */
  async findById(id: string): Promise<WorkflowDefinitionAggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id, isDeleted: false },
      include: { stages: { orderBy: { displayOrder: 'asc' } } },
    });
    return record
      ? (this.mapper as WorkflowDefinitionMapper).toDomain(record)
      : null;
  }

  async findByProcessCodeAndCompany(
    processCode: string,
    companyId: string,
  ): Promise<WorkflowDefinitionAggregate | null> {
    const record = await this.delegate.findFirst({
      where: { processCode, companyId, isDeleted: false },
      include: { stages: { orderBy: { displayOrder: 'asc' } } },
    });
    return record
      ? (this.mapper as WorkflowDefinitionMapper).toDomain(record)
      : null;
  }

  async findActiveByEntityTypeAndCompany(
    entityType: string,
    companyId: string,
  ): Promise<WorkflowDefinitionAggregate[]> {
    const records = await this.delegate.findMany({
      where: {
        entityType,
        companyId,
        status: WorkflowStatus.ACTIVE,
        isDeleted: false,
      },
      include: { stages: { orderBy: { displayOrder: 'asc' } } },
    });
    return records.map((r: any) =>
      (this.mapper as WorkflowDefinitionMapper).toDomain(r),
    );
  }

  async listByCompany(
    companyId: string,
    status?: WorkflowStatus,
    entityType?: string,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<WorkflowDefinitionAggregate>> {
    const where: any = { companyId, isDeleted: false };
    if (status) where.status = status;
    if (entityType) where.entityType = entityType;

    const page = pagination?.page ?? 1;
    const limit = Math.min(pagination?.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const orderBy = sort
      ? { [sort.field]: sort.direction }
      : { createdAt: 'desc' as const };

    const [records, total] = await Promise.all([
      this.delegate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { stages: { orderBy: { displayOrder: 'asc' } } },
      }),
      this.delegate.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: records.map((r: any) =>
        (this.mapper as WorkflowDefinitionMapper).toDomain(r),
      ),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
