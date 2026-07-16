import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { LeaveStatus } from '../enums/LeaveEnums';
import { DateRange } from '../value-objects/DateRange';
import { LeaveDuration } from '../value-objects/LeaveDuration';
import {
  LeaveAppliedEvent,
  LeaveCancelledEvent,
  LeaveDeletedEvent,
} from '../events/LeaveEvents';

export interface LeaveRequestProps extends TenantIsolatedEntityProps {
  employeeId: Identifier<string>;
  leaveTypeId: Identifier<string>;
  status: LeaveStatus;
  dateRange: DateRange;
  duration: LeaveDuration;
  reason: string;
  attachmentUrl?: string | null;
  workflowInstanceId?: Identifier<string> | null;
}

export class LeaveRequestAggregate extends AggregateRoot<LeaveRequestProps> {
  private constructor(props: LeaveRequestProps, id: Identifier<string>) {
    super(props, id);
  }

  // ─── Factory ─────────────────────────────────────────────────────────────

  public static create(
    props: LeaveRequestProps,
    id: Identifier<string>,
    performedBy: string,
  ): LeaveRequestAggregate {
    const aggregate = new LeaveRequestAggregate(props, id);
    aggregate.addDomainEvent(
      new LeaveAppliedEvent(
        id.toString(),
        props.companyId.toString(),
        props.employeeId.toString(),
        props.leaveTypeId.toString(),
        performedBy,
      ),
    );
    return aggregate;
  }

  public static reconstitute(
    props: LeaveRequestProps,
    id: Identifier<string>,
  ): LeaveRequestAggregate {
    return new LeaveRequestAggregate(props, id);
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  get businessId(): string {
    return this.props.businessId;
  }
  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  get employeeId(): Identifier<string> {
    return this.props.employeeId;
  }
  get leaveTypeId(): Identifier<string> {
    return this.props.leaveTypeId;
  }
  get status(): LeaveStatus {
    return this.props.status;
  }
  get dateRange(): DateRange {
    return this.props.dateRange;
  }
  get duration(): LeaveDuration {
    return this.props.duration;
  }
  get reason(): string {
    return this.props.reason;
  }
  get attachmentUrl(): string | null | undefined {
    return this.props.attachmentUrl;
  }
  get workflowInstanceId(): Identifier<string> | null | undefined {
    return this.props.workflowInstanceId;
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

  // ─── Behaviors ───────────────────────────────────────────────────────────

  approve(performedBy: string): void {
    if (this.props.status !== LeaveStatus.PENDING) {
      throw new Error('Only pending leave requests can be approved.');
    }
    this.props.status = LeaveStatus.APPROVED;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  reject(performedBy: string): void {
    if (this.props.status !== LeaveStatus.PENDING) {
      throw new Error('Only pending leave requests can be rejected.');
    }
    this.props.status = LeaveStatus.REJECTED;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  cancel(performedBy: string, notes?: string): void {
    if (
      this.props.status === LeaveStatus.REJECTED ||
      this.props.status === LeaveStatus.CANCELLED
    ) {
      throw new Error(
        'Leave request cannot be cancelled in its current state.',
      );
    }
    this.props.status = LeaveStatus.CANCELLED;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addDomainEvent(
      new LeaveCancelledEvent(
        this.id.toString(),
        this.props.companyId.toString(),
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
      new LeaveDeletedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        deletedBy,
      ),
    );
  }
}
