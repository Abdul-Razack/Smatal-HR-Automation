import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { WorkflowInstanceAggregate } from '../../domain/aggregates/WorkflowInstanceAggregate';
import { WorkflowHistoryEntity } from '../../domain/entities/WorkflowHistoryEntity';
import { WorkflowInstanceStatus } from '../../domain/enums/WorkflowEnums';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { WorkflowInstanceResponseDto } from '../../application/dto/responses/WorkflowResponseDtos';

export interface PrismaWorkflowInstanceRow {
  id: string;
  businessId: string;
  workflowDefinitionId: string;
  companyId: string;
  entityType: string;
  entityId: string;
  candidateId: string | null;
  employeeId: string | null;
  currentStageId: string | null;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  /** The ordered list of stage IDs from the definition (joined) */
  definitionStageIds?: string[];
}

export interface PrismaWorkflowHistoryRow {
  id: string;
  workflowInstanceId: string;
  stageId: string;
  action: string;
  notes: string | null;
  performedBy: string;
  performedAt: Date;
  metadata: Record<string, unknown> | null;
}

@Injectable()
export class WorkflowInstanceMapper implements Mapper<
  WorkflowInstanceAggregate,
  WorkflowInstanceResponseDto,
  PrismaWorkflowInstanceRow
> {
  toDomain(row: PrismaWorkflowInstanceRow): WorkflowInstanceAggregate {
    return WorkflowInstanceAggregate.reconstitute(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        workflowDefinitionId: row.workflowDefinitionId,
        entityType: row.entityType,
        entityId: row.entityId,
        candidateId: row.candidateId,
        employeeId: row.employeeId,
        currentStageId: row.currentStageId,
        status: row.status as WorkflowInstanceStatus,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        definitionStageIds: row.definitionStageIds ?? [],
        history: [], // history loaded separately
        isDeleted: row.isDeleted,
        deletedAt: row.deletedAt,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
      },
      new Identifier<string>(row.id),
    );
  }

  historyToDomain(row: PrismaWorkflowHistoryRow): WorkflowHistoryEntity {
    return WorkflowHistoryEntity.reconstitute(row.id, {
      workflowInstanceId: row.workflowInstanceId,
      stageId: row.stageId,
      action: row.action,
      notes: row.notes,
      performedBy: row.performedBy,
      performedAt: row.performedAt,
      metadata: row.metadata,
    });
  }

  toResponseDto(
    entity: WorkflowInstanceAggregate,
  ): WorkflowInstanceResponseDto {
    const dto = new WorkflowInstanceResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.workflowDefinitionId = entity.workflowDefinitionId;
    dto.entityType = entity.entityType;
    dto.entityId = entity.entityId;
    dto.candidateId = entity.candidateId;
    dto.employeeId = entity.employeeId;
    dto.currentStageId = entity.currentStageId;
    dto.status = entity.status;
    dto.startedAt = entity.startedAt;
    dto.completedAt = entity.completedAt;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toDTO(entity: WorkflowInstanceAggregate): WorkflowInstanceResponseDto {
    return this.toResponseDto(entity);
  }

  toPersistence(entity: WorkflowInstanceAggregate): PrismaWorkflowInstanceRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      workflowDefinitionId: entity.workflowDefinitionId,
      entityType: entity.entityType,
      entityId: entity.entityId,
      candidateId: entity.candidateId ?? null,
      employeeId: entity.employeeId ?? null,
      currentStageId: entity.currentStageId ?? null,
      status: entity.status,
      startedAt: entity.startedAt ?? null,
      completedAt: entity.completedAt ?? null,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt ?? null,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }

  historyToPersistence(entry: WorkflowHistoryEntity): PrismaWorkflowHistoryRow {
    return {
      id: entry.id,
      workflowInstanceId: entry.workflowInstanceId,
      stageId: entry.stageId,
      action: entry.action,
      notes: entry.notes,
      performedBy: entry.performedBy,
      performedAt: entry.performedAt,
      metadata: entry.metadata,
    };
  }
}
