import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import {
  EmployeeStatus,
  EMPLOYEE_STATUS_TRANSITIONS,
} from '../enums/EmployeeStatus';
import {
  EmployeeCreatedEvent,
  EmployeeUpdatedEvent,
  EmployeeStatusChangedEvent,
  EmployeeTerminatedEvent,
  EmployeeDeletedEvent,
} from '../events/EmployeeEvents';
import { InvalidEmployeeStatusTransitionException } from '../exceptions/EmployeeExceptions';

export interface EmployeeProps extends TenantIsolatedEntityProps {
  profileId: string;
  status: EmployeeStatus;
  joinedDate: Date;
  departmentId?: string | null;
  designationId?: string | null;
  branchId?: string | null;
  reportsToId?: string | null;
  employeeNumber?: string | null;
  confirmationDate?: Date | null;
  probationEndDate?: Date | null;
  terminationDate?: Date | null;
}

/**
 * Employee Aggregate Root.
 * Created from a Candidate conversion — ALWAYS reuses the same Profile.
 * Maintains its own lifecycle independently of the Candidate.
 */
export class EmployeeAggregate extends AggregateRoot<EmployeeProps> {
  private constructor(props: EmployeeProps, id: Identifier<string>) {
    super(props, id);
  }

  // ─── Factory ─────────────────────────────────────────────────────────────

  static create(
    props: EmployeeProps,
    id: Identifier<string>,
    performedBy: string,
  ): EmployeeAggregate {
    const employee = new EmployeeAggregate(props, id);
    employee.addDomainEvent(
      new EmployeeCreatedEvent(
        id.toString(),
        props.companyId.toString(),
        props.profileId,
        props.businessId,
        performedBy,
      ),
    );
    return employee;
  }

  static reconstitute(
    props: EmployeeProps,
    id: Identifier<string>,
  ): EmployeeAggregate {
    return new EmployeeAggregate(props, id);
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  get profileId(): string {
    return this.props.profileId;
  }
  get status(): EmployeeStatus {
    return this.props.status;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get joinedDate(): Date {
    return this.props.joinedDate;
  }
  get departmentId(): string | null | undefined {
    return this.props.departmentId;
  }
  get designationId(): string | null | undefined {
    return this.props.designationId;
  }
  get branchId(): string | null | undefined {
    return this.props.branchId;
  }
  get reportsToId(): string | null | undefined {
    return this.props.reportsToId;
  }
  get employeeNumber(): string | null | undefined {
    return this.props.employeeNumber;
  }
  get confirmationDate(): Date | null | undefined {
    return this.props.confirmationDate;
  }
  get probationEndDate(): Date | null | undefined {
    return this.props.probationEndDate;
  }
  get terminationDate(): Date | null | undefined {
    return this.props.terminationDate;
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
    departmentId: string | null | undefined,
    designationId: string | null | undefined,
    branchId: string | null | undefined,
    reportsToId: string | null | undefined,
    employeeNumber: string | null | undefined,
    performedBy: string,
  ): void {
    if (this.props.isDeleted)
      throw new Error('Cannot update a deleted employee');
    if (departmentId !== undefined) this.props.departmentId = departmentId;
    if (designationId !== undefined) this.props.designationId = designationId;
    if (branchId !== undefined) this.props.branchId = branchId;
    if (reportsToId !== undefined) this.props.reportsToId = reportsToId;
    if (employeeNumber !== undefined)
      this.props.employeeNumber = employeeNumber;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addDomainEvent(
      new EmployeeUpdatedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  private transitionStatus(
    newStatus: EmployeeStatus,
    performedBy: string,
    reason?: string,
  ): void {
    const allowed = EMPLOYEE_STATUS_TRANSITIONS[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new InvalidEmployeeStatusTransitionException(
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
      new EmployeeStatusChangedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        previous,
        newStatus,
        performedBy,
        reason,
      ),
    );
  }

  activate(performedBy: string): void {
    this.transitionStatus(EmployeeStatus.ACTIVE, performedBy);
    if (
      this.props.confirmationDate === null ||
      this.props.confirmationDate === undefined
    ) {
      this.props.confirmationDate = new Date();
    }
  }

  putOnNotice(performedBy: string, reason?: string): void {
    this.transitionStatus(EmployeeStatus.NOTICE, performedBy, reason);
  }

  terminate(terminationDate: Date, reason: string, performedBy: string): void {
    this.transitionStatus(EmployeeStatus.TERMINATED, performedBy, reason);
    this.props.terminationDate = terminationDate;
    this.addDomainEvent(
      new EmployeeTerminatedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        terminationDate,
        reason,
        performedBy,
      ),
    );
  }

  resign(performedBy: string, reason?: string): void {
    this.transitionStatus(EmployeeStatus.RESIGNED, performedBy, reason);
  }

  retire(performedBy: string): void {
    this.transitionStatus(EmployeeStatus.RETIRED, performedBy);
  }

  softDelete(deletedBy: string): void {
    this.props.isDeleted = true;
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.updatedBy = deletedBy;
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addDomainEvent(
      new EmployeeDeletedEvent(
        this.id.toString(),
        this.props.companyId.toString(),
        deletedBy,
      ),
    );
  }
}
