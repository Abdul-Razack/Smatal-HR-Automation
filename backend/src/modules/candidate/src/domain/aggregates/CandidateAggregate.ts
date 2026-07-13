import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import {
  CandidateStatus,
  CANDIDATE_STATUS_TRANSITIONS,
} from '../enums/CandidateStatus';
import {
  CandidateCreatedEvent,
  CandidateUpdatedEvent,
  CandidateStatusChangedEvent,
  CandidateConvertedEvent,
  CandidateDeletedEvent,
} from '../events/CandidateEvents';
import {
  InvalidCandidateStatusTransitionException,
  CandidateAlreadyConvertedException,
  CandidateNotSelectedException,
} from '../exceptions/CandidateExceptions';

export interface CandidateProps extends TenantIsolatedEntityProps {
  profileId: string;
  status: CandidateStatus;
  appliedDate?: Date | null;
  source?: string | null;
  referredBy?: string | null;
  notes?: string | null;
}

/**
 * Candidate Aggregate Root.
 * Encapsulates the full candidate lifecycle from DRAFT through CONVERTED.
 * Shares a Profile with the resulting Employee — Profile is never duplicated.
 */
export class CandidateAggregate extends AggregateRoot<CandidateProps> {
  private constructor(props: CandidateProps, id: Identifier<string>) {
    super(props, id);
  }

  // ─── Factory ─────────────────────────────────────────────────────────────

  static create(
    props: CandidateProps,
    id: Identifier<string>,
    performedBy: string,
  ): CandidateAggregate {
    const candidate = new CandidateAggregate(props, id);
    candidate.addDomainEvent(
      new CandidateCreatedEvent(
        id.toString(),
        props.companyId.toString(),
        props.profileId,
        props.businessId,
        performedBy,
      ),
    );
    return candidate;
  }

  static reconstitute(
    props: CandidateProps,
    id: Identifier<string>,
  ): CandidateAggregate {
    return new CandidateAggregate(props, id);
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  get profileId(): string {
    return this.props.profileId;
  }
  get status(): CandidateStatus {
    return this.props.status;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get appliedDate(): Date | null | undefined {
    return this.props.appliedDate;
  }
  get source(): string | null | undefined {
    return this.props.source;
  }
  get referredBy(): string | null | undefined {
    return this.props.referredBy;
  }
  get notes(): string | null | undefined {
    return this.props.notes;
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

  // ─── Behaviour ───────────────────────────────────────────────────────────

  update(
    notes: string | null | undefined,
    source: string | null | undefined,
    referredBy: string | null | undefined,
    appliedDate: Date | null | undefined,
    performedBy: string,
  ): void {
    if (this.props.isDeleted) {
      throw new Error('Cannot update a deleted candidate');
    }
    if (this.props.notes !== notes) this.props.notes = notes;
    if (this.props.source !== source) this.props.source = source;
    if (this.props.referredBy !== referredBy)
      this.props.referredBy = referredBy;
    if (appliedDate !== undefined) this.props.appliedDate = appliedDate;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addDomainEvent(
      new CandidateUpdatedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  private transitionStatus(
    newStatus: CandidateStatus,
    performedBy: string,
    reason?: string,
  ): void {
    const allowed = CANDIDATE_STATUS_TRANSITIONS[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new InvalidCandidateStatusTransitionException(
        this.props.status,
        newStatus,
      );
    }
    const previous = this.props.status;
    this.props.status = newStatus;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addDomainEvent(
      new CandidateStatusChangedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        previous,
        newStatus,
        performedBy,
        reason,
      ),
    );
  }

  submit(performedBy: string): void {
    this.transitionStatus(CandidateStatus.APPLIED, performedBy);
  }

  screen(performedBy: string): void {
    this.transitionStatus(CandidateStatus.SCREENING, performedBy);
  }

  startInterviewing(performedBy: string): void {
    this.transitionStatus(CandidateStatus.INTERVIEWING, performedBy);
  }

  select(performedBy: string): void {
    this.transitionStatus(CandidateStatus.SELECTED, performedBy);
  }

  reject(performedBy: string, reason?: string): void {
    this.transitionStatus(CandidateStatus.REJECTED, performedBy, reason);
  }

  withdraw(performedBy: string, reason?: string): void {
    this.transitionStatus(CandidateStatus.WITHDRAWN, performedBy, reason);
  }

  markConverted(employeeId: string, performedBy: string): void {
    if (this.props.status === CandidateStatus.CONVERTED) {
      throw new CandidateAlreadyConvertedException(this.id.toString());
    }
    if (this.props.status !== CandidateStatus.SELECTED) {
      throw new CandidateNotSelectedException(this.id.toString());
    }
    this.transitionStatus(CandidateStatus.CONVERTED, performedBy);
    this.addDomainEvent(
      new CandidateConvertedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        this.props.profileId,
        employeeId,
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

    this.addDomainEvent(
      new CandidateDeletedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        deletedBy,
      ),
    );
  }
}
