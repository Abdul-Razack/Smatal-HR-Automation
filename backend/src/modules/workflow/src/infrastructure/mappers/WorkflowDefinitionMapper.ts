import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { WorkflowDefinitionAggregate } from '../../domain/aggregates/WorkflowDefinitionAggregate';
import { WorkflowStageVO } from '../../domain/value-objects/WorkflowStageVO';
import { WorkflowStatus } from '../../domain/enums/WorkflowEnums';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import {
  WorkflowDefinitionResponseDto,
  WorkflowStageResponseDto,
} from '../../application/dto/responses/WorkflowResponseDtos';

export interface PrismaWorkflowDefinitionRow {
  id: string;
  businessId: string;
  companyId: string;
  name: string;
  description: string | null;
  entityType: string;
  processCode: string | null;
  status: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  stages?: PrismaWorkflowStageRow[];
}

export interface PrismaWorkflowStageRow {
  id: string;
  workflowDefinitionId: string;
  name: string;
  code: string;
  description: string | null;
  displayOrder: number;
  isTerminal: boolean;
  isFinal: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

@Injectable()
export class WorkflowDefinitionMapper implements Mapper<
  WorkflowDefinitionAggregate,
  WorkflowDefinitionResponseDto,
  PrismaWorkflowDefinitionRow
> {
  toDomain(row: PrismaWorkflowDefinitionRow): WorkflowDefinitionAggregate {
    const stages = (row.stages ?? []).map(
      (s) =>
        new WorkflowStageVO({
          id: s.id,
          name: s.name,
          code: s.code,
          description: s.description,
          displayOrder: s.displayOrder,
          isTerminal: s.isTerminal,
          isFinal: s.isFinal,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          createdBy: s.createdBy,
          updatedBy: s.updatedBy,
        }),
    );

    return WorkflowDefinitionAggregate.reconstitute(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        name: row.name,
        description: row.description,
        entityType: row.entityType,
        processCode: row.processCode,
        status: row.status as WorkflowStatus,
        stages,
        isDeleted: row.isDeleted,
        deletedAt: row.deletedAt,
        deletedBy: row.deletedBy,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
      },
      new Identifier<string>(row.id),
    );
  }

  toResponseDto(
    entity: WorkflowDefinitionAggregate,
  ): WorkflowDefinitionResponseDto {
    const dto = new WorkflowDefinitionResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.name = entity.name;
    dto.description = entity.description;
    dto.entityType = entity.entityType;
    dto.processCode = entity.processCode;
    dto.status = entity.status;
    dto.stages = entity.stages.map((s) => {
      const sd = new WorkflowStageResponseDto();
      sd.id = s.id;
      sd.name = s.name;
      sd.code = s.code;
      sd.description = s.description;
      sd.displayOrder = s.displayOrder;
      sd.isTerminal = s.isTerminal;
      sd.isFinal = s.isFinal;
      return sd;
    });
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toDTO(entity: WorkflowDefinitionAggregate): WorkflowDefinitionResponseDto {
    return this.toResponseDto(entity);
  }

  toPersistence(
    entity: WorkflowDefinitionAggregate,
  ): PrismaWorkflowDefinitionRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      name: entity.name,
      description: entity.description ?? null,
      entityType: entity.entityType,
      processCode: entity.processCode ?? null,
      status: entity.status,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt ?? null,
      deletedBy: entity.deletedBy ?? null,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      stages: entity.stages.map((s) => ({
        id: s.id,
        workflowDefinitionId: entity.id.toString(),
        name: s.name,
        code: s.code,
        description: s.description ?? null,
        displayOrder: s.displayOrder,
        isTerminal: s.isTerminal,
        isFinal: s.isFinal,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        createdBy: s.createdBy,
        updatedBy: s.updatedBy,
      })),
    };
  }
}
