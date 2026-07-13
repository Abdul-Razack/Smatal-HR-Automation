import {
  WorkflowStatus,
  WorkflowInstanceStatus,
} from '../../../domain/enums/WorkflowEnums';

export class WorkflowStageResponseDto {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  displayOrder: number;
  isTerminal: boolean;
  isFinal: boolean;
}

export class WorkflowDefinitionResponseDto {
  id: string;
  businessId: string;
  companyId: string;
  name: string;
  description?: string | null;
  entityType: string;
  processCode?: string | null;
  status: WorkflowStatus;
  stages: WorkflowStageResponseDto[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

export class WorkflowHistoryResponseDto {
  id: string;
  workflowInstanceId: string;
  stageId: string;
  action: string;
  notes?: string | null;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, unknown> | null;
}

export class WorkflowInstanceResponseDto {
  id: string;
  businessId: string;
  companyId: string;
  workflowDefinitionId: string;
  entityType: string;
  entityId: string;
  candidateId?: string | null;
  employeeId?: string | null;
  currentStageId?: string | null;
  status: WorkflowInstanceStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}
