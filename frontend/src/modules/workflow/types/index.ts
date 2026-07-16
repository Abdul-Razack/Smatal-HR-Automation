export interface WorkflowStage {
  id: string;
  name: string;
  code: string;
  displayOrder: number;
  description?: string;
  isTerminal: boolean;
  isFinal: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  entityType: string;
  description?: string;
  processCode: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  stages: WorkflowStage[];
}
