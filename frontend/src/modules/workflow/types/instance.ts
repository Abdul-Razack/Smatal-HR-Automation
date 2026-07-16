import { WorkflowStage } from './index';

export type WorkflowInstanceStatus = 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface WorkflowInstance {
  id: string;
  workflowDefinitionId: string;
  entityType: string;
  entityId: string;
  status: WorkflowInstanceStatus;
  currentStageId?: string;
  candidateId?: string;
  employeeId?: string;
  startedAt: string;
  completedAt?: string;
  currentStage?: WorkflowStage;
  // Workflow Definition can be joined if backend supports it
}

export interface WorkflowHistoryEvent {
  id: string;
  workflowInstanceId: string;
  stageId?: string;
  action: string;
  remarks?: string;
  createdAt: string;
  user?: { name: string; email: string };
}
