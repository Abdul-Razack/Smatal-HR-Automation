import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { WorkflowInstanceStatus, WorkflowAction } from '../enums/WorkflowEnums';
import { WorkflowHistoryEntity } from '../entities/WorkflowHistoryEntity';
import {
  WorkflowInstanceStartedEvent,
  WorkflowStageAdvancedEvent,
  WorkflowInstanceCompletedEvent,
  WorkflowInstanceCancelledEvent,
  WorkflowStageRejectedEvent,
  WorkflowStageReturnedEvent,
} from '../events/WorkflowEvents';
import {
  WorkflowInstanceNotInProgressException,
  WorkflowInstanceAlreadyCompletedException,
  WorkflowInstanceAlreadyCancelledException,
  WorkflowNoCurrentStageException,
  WorkflowReturnTargetInvalidException,
} from '../exceptions/WorkflowExceptions';

export interface WorkflowInstanceProps extends TenantIsolatedEntityProps {
  workflowDefinitionId: string;
  entityType: string;
  entityId: string;
  candidateId?: string | null;
  employeeId?: string | null;
  currentStageId?: string | null;
  status: WorkflowInstanceStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  /** IDs of all stages in the definition, in order — used for return-validation */
  definitionStageIds: string[];
  /** In-memory history entries; persisted separately */
  history: WorkflowHistoryEntity[];
}

/**
 * WorkflowInstanceAggregate
 *
 * Represents one execution of a WorkflowDefinition for a specific entity (Candidate or Employee).
 * Tracks the current stage, execution history, and overall lifecycle status.
 *
 * Design Notes:
 * - History entries are immutable once appended.
 * - Stage transitions are recorded in-memory for the UoW to persist.
 * - Stage navigation is controlled by the definition's ordered stage list.
 */
export class WorkflowInstanceAggregate extends AggregateRoot<WorkflowInstanceProps> {
  private constructor(props: WorkflowInstanceProps, id: Identifier<string>) {
    super(props, id);
  }

  // ─── Factory ─────────────────────────────────────────────────────────────

  static create(
    props: WorkflowInstanceProps,
    id: Identifier<string>,
    performedBy: string,
  ): WorkflowInstanceAggregate {
    const agg = new WorkflowInstanceAggregate(props, id);
    agg.addDomainEvent(
      new WorkflowInstanceStartedEvent(
        id.toString(),
        props.businessId,
        props.companyId.toString(),
        props.entityType,
        props.entityId,
        props.workflowDefinitionId,
        performedBy,
      ),
    );
    return agg;
  }

  static reconstitute(
    props: WorkflowInstanceProps,
    id: Identifier<string>,
  ): WorkflowInstanceAggregate {
    return new WorkflowInstanceAggregate(props, id);
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get workflowDefinitionId(): string {
    return this.props.workflowDefinitionId;
  }
  get entityType(): string {
    return this.props.entityType;
  }
  get entityId(): string {
    return this.props.entityId;
  }
  get candidateId(): string | null | undefined {
    return this.props.candidateId;
  }
  get employeeId(): string | null | undefined {
    return this.props.employeeId;
  }
  get currentStageId(): string | null | undefined {
    return this.props.currentStageId;
  }
  get status(): WorkflowInstanceStatus {
    return this.props.status;
  }
  get startedAt(): Date | null | undefined {
    return this.props.startedAt;
  }
  get completedAt(): Date | null | undefined {
    return this.props.completedAt;
  }
  get history(): WorkflowHistoryEntity[] {
    return [...this.props.history];
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

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private assertInProgress(): void {
    if (this.props.status === WorkflowInstanceStatus.COMPLETED) {
      throw new WorkflowInstanceAlreadyCompletedException(this.id.toString());
    }
    if (this.props.status === WorkflowInstanceStatus.CANCELLED) {
      throw new WorkflowInstanceAlreadyCancelledException(this.id.toString());
    }
    if (this.props.status !== WorkflowInstanceStatus.IN_PROGRESS) {
      throw new WorkflowInstanceNotInProgressException(this.id.toString());
    }
  }

  private recordHistory(
    stageId: string,
    action: WorkflowAction,
    performedBy: string,
    notes?: string,
    metadata?: Record<string, unknown>,
  ): void {
    const entry = WorkflowHistoryEntity.create({
      workflowInstanceId: this.id.toString(),
      stageId,
      action: action.toString(),
      notes: notes ?? null,
      performedBy,
      performedAt: new Date(),
      metadata: metadata ?? null,
    });
    this.props.history.push(entry);
  }

  private bumpVersion(performedBy: string): void {
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  // ─── Behaviours ──────────────────────────────────────────────────────────

  /**
   * Start: PENDING → IN_PROGRESS, set first stage.
   */
  start(firstStageId: string, performedBy: string): void {
    if (this.props.status !== WorkflowInstanceStatus.PENDING) {
      throw new WorkflowInstanceNotInProgressException(this.id.toString());
    }
    this.props.status = WorkflowInstanceStatus.IN_PROGRESS;
    this.props.currentStageId = firstStageId;
    this.props.startedAt = new Date();
    this.recordHistory(
      firstStageId,
      WorkflowAction.START,
      performedBy,
      'Workflow started',
    );
    this.bumpVersion(performedBy);
  }

  /**
   * Advance: move to the next stage (general forward movement).
   */
  advance(nextStageId: string, performedBy: string, remarks?: string): void {
    this.assertInProgress();
    if (!this.props.currentStageId)
      throw new WorkflowNoCurrentStageException(this.id.toString());
    const previous = this.props.currentStageId;
    this.props.currentStageId = nextStageId;
    this.recordHistory(
      nextStageId,
      WorkflowAction.ADVANCE,
      performedBy,
      remarks,
    );
    this.bumpVersion(performedBy);
    this.addDomainEvent(
      new WorkflowStageAdvancedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        previous,
        nextStageId,
        WorkflowAction.ADVANCE,
        performedBy,
        remarks,
      ),
    );
  }

  /**
   * Approve: record approval at current stage, then advance to next stage.
   */
  approve(
    nextStageId: string | null,
    performedBy: string,
    remarks?: string,
  ): void {
    this.assertInProgress();
    const stageId = this.props.currentStageId;
    if (!stageId) throw new WorkflowNoCurrentStageException(this.id.toString());
    this.recordHistory(stageId, WorkflowAction.APPROVE, performedBy, remarks);

    if (nextStageId) {
      const previous = stageId;
      this.props.currentStageId = nextStageId;
      this.bumpVersion(performedBy);
      this.addDomainEvent(
        new WorkflowStageAdvancedEvent(
          this.id.toString(),
          this.props.companyId.toString(),
          previous,
          nextStageId,
          WorkflowAction.APPROVE,
          performedBy,
          remarks,
        ),
      );
    } else {
      // No next stage — complete the workflow
      this.complete(performedBy, remarks);
    }
  }

  /**
   * Reject: record rejection and mark instance FAILED.
   */
  reject(performedBy: string, reason: string): void {
    this.assertInProgress();
    const stageId = this.props.currentStageId;
    if (!stageId) throw new WorkflowNoCurrentStageException(this.id.toString());
    this.recordHistory(stageId, WorkflowAction.REJECT, performedBy, reason);
    this.props.status = WorkflowInstanceStatus.FAILED;
    this.bumpVersion(performedBy);
    this.addDomainEvent(
      new WorkflowStageRejectedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        stageId,
        reason,
        performedBy,
      ),
    );
  }

  /**
   * Return: move back to an earlier stage.
   */
  returnToStage(
    targetStageId: string,
    performedBy: string,
    reason: string,
  ): void {
    this.assertInProgress();
    const stageId = this.props.currentStageId;
    if (!stageId) throw new WorkflowNoCurrentStageException(this.id.toString());
    if (!this.props.definitionStageIds.includes(targetStageId)) {
      throw new WorkflowReturnTargetInvalidException(targetStageId);
    }
    const previous = stageId;
    this.props.currentStageId = targetStageId;
    this.recordHistory(
      targetStageId,
      WorkflowAction.RETURN,
      performedBy,
      reason,
    );
    this.bumpVersion(performedBy);
    this.addDomainEvent(
      new WorkflowStageReturnedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        targetStageId,
        reason,
        performedBy,
      ),
    );
  }

  /**
   * Cancel: mark instance CANCELLED.
   */
  cancel(performedBy: string, reason: string): void {
    if (this.props.status === WorkflowInstanceStatus.COMPLETED) {
      throw new WorkflowInstanceAlreadyCompletedException(this.id.toString());
    }
    if (this.props.status === WorkflowInstanceStatus.CANCELLED) {
      throw new WorkflowInstanceAlreadyCancelledException(this.id.toString());
    }
    const stageId = this.props.currentStageId ?? 'none';
    this.recordHistory(stageId, WorkflowAction.CANCEL, performedBy, reason);
    this.props.status = WorkflowInstanceStatus.CANCELLED;
    this.bumpVersion(performedBy);
    this.addDomainEvent(
      new WorkflowInstanceCancelledEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        reason,
        performedBy,
      ),
    );
  }

  /**
   * Complete: mark instance COMPLETED and set completedAt.
   */
  complete(performedBy: string, remarks?: string): void {
    this.assertInProgress();
    const stageId = this.props.currentStageId;
    if (stageId)
      this.recordHistory(
        stageId,
        WorkflowAction.COMPLETE,
        performedBy,
        remarks,
      );
    this.props.status = WorkflowInstanceStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.currentStageId = null;
    this.bumpVersion(performedBy);
    this.addDomainEvent(
      new WorkflowInstanceCompletedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        this.props.entityType,
        this.props.entityId,
        performedBy,
      ),
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
