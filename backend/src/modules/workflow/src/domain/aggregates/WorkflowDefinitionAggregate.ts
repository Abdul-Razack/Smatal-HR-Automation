import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { WorkflowStatus } from '../enums/WorkflowEnums';
import {
  WorkflowStageVO,
  WorkflowStageVOProps,
} from '../value-objects/WorkflowStageVO';
import {
  WorkflowDefinitionCreatedEvent,
  WorkflowDefinitionUpdatedEvent,
  WorkflowDefinitionPublishedEvent,
  WorkflowDefinitionArchivedEvent,
  WorkflowStageAddedEvent,
  WorkflowStageRemovedEvent,
} from '../events/WorkflowEvents';
import {
  WorkflowDefinitionAlreadyPublishedException,
  WorkflowDefinitionArchivedCannotModifyException,
  WorkflowDefinitionHasNoStagesException,
  WorkflowStageDuplicateCodeException,
  WorkflowStageNotFoundException,
} from '../exceptions/WorkflowExceptions';

export interface WorkflowDefinitionProps extends TenantIsolatedEntityProps {
  name: string;
  description?: string | null;
  entityType: string; // 'CANDIDATE' | 'EMPLOYEE'
  processCode?: string | null; // e.g. 'OFFER_LETTER'
  status: WorkflowStatus;
  stages: WorkflowStageVO[];
}

/**
 * WorkflowDefinitionAggregate
 *
 * Defines a named, versioned, multi-stage workflow template for a company.
 * Must be ACTIVE before any WorkflowInstance can be started.
 * Stages are ordered by displayOrder and stored as immutable Value Objects.
 */
export class WorkflowDefinitionAggregate extends AggregateRoot<WorkflowDefinitionProps> {
  private constructor(props: WorkflowDefinitionProps, id: Identifier<string>) {
    super(props, id);
  }

  // ─── Factory ─────────────────────────────────────────────────────────────

  static create(
    props: WorkflowDefinitionProps,
    id: Identifier<string>,
    performedBy: string,
  ): WorkflowDefinitionAggregate {
    const agg = new WorkflowDefinitionAggregate(props, id);
    agg.addDomainEvent(
      new WorkflowDefinitionCreatedEvent(
        id.toString(),
        props.companyId.toString(),
        props.entityType,
        performedBy,
      ),
    );
    return agg;
  }

  static reconstitute(
    props: WorkflowDefinitionProps,
    id: Identifier<string>,
  ): WorkflowDefinitionAggregate {
    return new WorkflowDefinitionAggregate(props, id);
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get entityType(): string {
    return this.props.entityType;
  }
  get processCode(): string | null | undefined {
    return this.props.processCode;
  }
  get status(): WorkflowStatus {
    return this.props.status;
  }
  get stages(): WorkflowStageVO[] {
    return [...this.props.stages];
  }
  get version(): number {
    return this.props.version;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
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
  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }
  get deletedBy(): string | null | undefined {
    return this.props.deletedBy;
  }

  // ─── Ordered Stages ──────────────────────────────────────────────────────

  get orderedStages(): WorkflowStageVO[] {
    return [...this.props.stages].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
  }

  getStageById(stageId: string): WorkflowStageVO | undefined {
    return this.props.stages.find((s) => s.id === stageId);
  }

  getFirstStage(): WorkflowStageVO | undefined {
    return this.orderedStages[0];
  }

  getNextStage(currentStageId: string): WorkflowStageVO | undefined {
    const ordered = this.orderedStages;
    const idx = ordered.findIndex((s) => s.id === currentStageId);
    return idx >= 0 ? ordered[idx + 1] : undefined;
  }

  // ─── Behaviours ──────────────────────────────────────────────────────────

  update(
    name: string | undefined,
    description: string | null | undefined,
    performedBy: string,
  ): void {
    if (this.props.status === WorkflowStatus.ARCHIVED) {
      throw new WorkflowDefinitionArchivedCannotModifyException(
        this.id.toString(),
      );
    }
    if (name !== undefined) this.props.name = name;
    if (description !== undefined) this.props.description = description;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addDomainEvent(
      new WorkflowDefinitionUpdatedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  publish(performedBy: string): void {
    if (this.props.status === WorkflowStatus.ACTIVE) {
      throw new WorkflowDefinitionAlreadyPublishedException(this.id.toString());
    }
    if (this.props.status === WorkflowStatus.ARCHIVED) {
      throw new WorkflowDefinitionArchivedCannotModifyException(
        this.id.toString(),
      );
    }
    if (this.props.stages.length === 0) {
      throw new WorkflowDefinitionHasNoStagesException(this.id.toString());
    }
    this.props.status = WorkflowStatus.ACTIVE;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addDomainEvent(
      new WorkflowDefinitionPublishedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  archive(performedBy: string): void {
    if (this.props.status === WorkflowStatus.ARCHIVED) {
      throw new WorkflowDefinitionArchivedCannotModifyException(
        this.id.toString(),
      );
    }
    this.props.status = WorkflowStatus.ARCHIVED;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addDomainEvent(
      new WorkflowDefinitionArchivedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  addStage(stageProps: WorkflowStageVOProps, performedBy: string): void {
    if (this.props.status === WorkflowStatus.ARCHIVED) {
      throw new WorkflowDefinitionArchivedCannotModifyException(
        this.id.toString(),
      );
    }
    const duplicate = this.props.stages.find((s) => s.code === stageProps.code);
    if (duplicate)
      throw new WorkflowStageDuplicateCodeException(stageProps.code);
    this.props.stages.push(new WorkflowStageVO(stageProps));
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addDomainEvent(
      new WorkflowStageAddedEvent(
        this.id.toString(),
        stageProps.code,
        performedBy,
      ),
    );
  }

  removeStage(stageId: string, performedBy: string): void {
    if (this.props.status === WorkflowStatus.ARCHIVED) {
      throw new WorkflowDefinitionArchivedCannotModifyException(
        this.id.toString(),
      );
    }
    const idx = this.props.stages.findIndex((s) => s.id === stageId);
    if (idx === -1) throw new WorkflowStageNotFoundException(stageId);
    this.props.stages.splice(idx, 1);
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addDomainEvent(
      new WorkflowStageRemovedEvent(this.id.toString(), stageId, performedBy),
    );
  }

  softDelete(deletedBy: string): void {
    this.props.isDeleted = true;
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.updatedBy = deletedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }
}
