import { v4 as uuidv4 } from 'uuid';

export interface WorkflowHistoryProps {
  workflowInstanceId: string;
  stageId: string;
  action: string;
  notes: string | null;
  performedBy: string;
  performedAt: Date;
  metadata: Record<string, unknown> | null;
}

/**
 * WorkflowHistoryEntity — immutable record of a single workflow stage action.
 * Once created, it must never be mutated. It is persisted independently.
 */
export class WorkflowHistoryEntity {
  private constructor(
    public readonly id: string,
    private readonly props: WorkflowHistoryProps,
  ) {}

  static create(props: WorkflowHistoryProps): WorkflowHistoryEntity {
    return new WorkflowHistoryEntity(uuidv4(), props);
  }

  static reconstitute(
    id: string,
    props: WorkflowHistoryProps,
  ): WorkflowHistoryEntity {
    return new WorkflowHistoryEntity(id, props);
  }

  get workflowInstanceId(): string {
    return this.props.workflowInstanceId;
  }
  get stageId(): string {
    return this.props.stageId;
  }
  get action(): string {
    return this.props.action;
  }
  get notes(): string | null {
    return this.props.notes;
  }
  get performedBy(): string {
    return this.props.performedBy;
  }
  get performedAt(): Date {
    return this.props.performedAt;
  }
  get metadata(): Record<string, unknown> | null {
    return this.props.metadata;
  }
}
