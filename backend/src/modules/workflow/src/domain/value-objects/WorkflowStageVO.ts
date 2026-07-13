/**
 * WorkflowStageVO — Value Object representing a single stage in a workflow definition.
 * Immutable — any mutation creates a new instance.
 */
export interface WorkflowStageVOProps {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  displayOrder: number;
  isTerminal: boolean;
  isFinal: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class WorkflowStageVO {
  constructor(private readonly props: WorkflowStageVOProps) {
    Object.freeze(this.props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get code(): string {
    return this.props.code;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get displayOrder(): number {
    return this.props.displayOrder;
  }
  get isTerminal(): boolean {
    return this.props.isTerminal;
  }
  get isFinal(): boolean {
    return this.props.isFinal;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }

  equals(other: WorkflowStageVO): boolean {
    return this.props.id === other.props.id;
  }

  toPlain(): WorkflowStageVOProps {
    return { ...this.props };
  }
}
