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
  EmployeePromotedEvent,
  EmployeeTransferredEvent,
} from '../events/EmployeeEvents';
import { InvalidEmployeeStatusTransitionException } from '../exceptions/EmployeeExceptions';
import { ResignationStatus } from '../enums/ResignationEnums';

export interface EmployeeProps extends TenantIsolatedEntityProps {
  profileId: string;
  status: EmployeeStatus;
  joinedDate: Date;
  departmentId?: string | null;
  designationId?: string | null;
  branchId?: string | null;
  reportsToId?: string | null;
  employeeNumber?: string | null;
  employmentType?: string | null;
  salary?: number | null;
  confirmationDate?: Date | null;
  probationEndDate?: Date | null;
  resignationDate?: Date | null;
  lastWorkingDate?: Date | null;
  noticePeriodDays?: number | null;
  terminationDate?: Date | null;
  resignationReason?: string | null;
  resignationStatus?: ResignationStatus | null;
}

/**
 * Employee Aggregate Root.
 * Created from a Candidate conversion — ALWAYS reuses the same Profile.
 * Maintains its own lifecycle independently of the Candidate.
 */
export class EmployeeAggregate extends AggregateRoot<EmployeeProps> {
  private _changeSets: Array<{ field: string; previous: string | null; new: string | null }> = [];

  private constructor(props: EmployeeProps, id: Identifier<string>) {
    super(props, id);
  }

  get changeSets() {
    return this._changeSets;
  }

  clearChangeSets() {
    this._changeSets = [];
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
  get employmentType(): string | null | undefined {
    return this.props.employmentType;
  }
  get salary(): number | null | undefined {
    return this.props.salary;
  }
  get confirmationDate(): Date | null | undefined {
    return this.props.confirmationDate;
  }
  get probationEndDate(): Date | null | undefined {
    return this.props.probationEndDate;
  }
  get resignationDate(): Date | null | undefined {
    return this.props.resignationDate;
  }
  get lastWorkingDate(): Date | null | undefined {
    return this.props.lastWorkingDate;
  }
  get noticePeriodDays(): number | null | undefined {
    return this.props.noticePeriodDays;
  }
  get terminationDate(): Date | null | undefined {
    return this.props.terminationDate;
  }
  get resignationReason(): string | null | undefined {
    return this.props.resignationReason;
  }
  get resignationStatus(): ResignationStatus | null | undefined {
    return this.props.resignationStatus;
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
    employmentType?: string | null,
    salary?: number | null,
    joinedDate?: Date | null,
  ): void {
    if (this.props.isDeleted)
      throw new Error('Cannot update a deleted employee');

    let isPromoted = false;
    let isTransferred = false;

    if (departmentId !== undefined && departmentId !== this.props.departmentId) {
      this._changeSets.push({ field: 'DEPARTMENT_CHANGED', previous: this.props.departmentId ?? null, new: departmentId ?? null });
      this.props.departmentId = departmentId;
      isTransferred = true;
    }
    if (designationId !== undefined && designationId !== this.props.designationId) {
      this._changeSets.push({ field: 'DESIGNATION_CHANGED', previous: this.props.designationId ?? null, new: designationId ?? null });
      this.props.designationId = designationId;
      isPromoted = true;
    }
    if (branchId !== undefined && branchId !== this.props.branchId) {
      this._changeSets.push({ field: 'BRANCH_CHANGED', previous: this.props.branchId ?? null, new: branchId ?? null });
      this.props.branchId = branchId;
      isTransferred = true;
    }
    if (reportsToId !== undefined && reportsToId !== this.props.reportsToId) {
      this._changeSets.push({ field: 'MANAGER_CHANGED', previous: this.props.reportsToId ?? null, new: reportsToId ?? null });
      this.props.reportsToId = reportsToId;
    }
    if (employeeNumber !== undefined && employeeNumber !== this.props.employeeNumber) {
      this.props.employeeNumber = employeeNumber;
    }
    if (employmentType !== undefined && employmentType !== this.props.employmentType) {
      this._changeSets.push({ field: 'EMPLOYMENT_TYPE_CHANGED', previous: this.props.employmentType ?? null, new: employmentType ?? null });
      this.props.employmentType = employmentType;
    }
    if (salary !== undefined && salary !== this.props.salary) {
      this._changeSets.push({ field: 'SALARY_CHANGED', previous: this.props.salary ? String(this.props.salary) : null, new: salary ? String(salary) : null });
      this.props.salary = salary;
    }
    if (joinedDate !== undefined && joinedDate !== null && joinedDate !== this.props.joinedDate) {
      this.props.joinedDate = joinedDate;
    }

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

    if (isPromoted && this.props.designationId) {
      this.addDomainEvent(
        new EmployeePromotedEvent(
          this.id.toString(),
          this.props.companyId.toString(),
          this.props.designationId,
          performedBy,
        ),
      );
    }

    if (isTransferred) {
      this.addDomainEvent(
        new EmployeeTransferredEvent(
          this.id.toString(),
          this.props.companyId.toString(),
          this.props.departmentId ?? null,
          this.props.branchId ?? null,
          performedBy,
        ),
      );
    }
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
    
    this._changeSets.push({ field: 'STATUS_CHANGED', previous: previous, new: newStatus });

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

  transitionLifecycle(
    newStatus: EmployeeStatus,
    performedBy: string,
    options?: {
      effectiveDate?: Date;
      confirmationDate?: Date;
      probationEndDate?: Date;
      resignationDate?: Date;
      lastWorkingDate?: Date;
      noticePeriodDays?: number;
      notes?: string;
    },
  ): void {
    if (this.props.isDeleted) {
      throw new Error('Cannot transition status of a deleted employee');
    }

    const previous = this.props.status;
    const allowed = EMPLOYEE_STATUS_TRANSITIONS[previous] || [];
    if (!allowed.includes(newStatus)) {
      throw new InvalidEmployeeStatusTransitionException(previous, newStatus);
    }

    // Logical date validations based on target status
    if (newStatus === EmployeeStatus.CONFIRMED) {
      const confDate = options?.confirmationDate ?? new Date();
      if (this.props.joinedDate && confDate < this.props.joinedDate) {
        throw new Error('Confirmation date cannot be earlier than joining date');
      }
      this.props.confirmationDate = confDate;
    } else if (newStatus === EmployeeStatus.PROBATION) {
      if (options?.probationEndDate) {
        if (this.props.joinedDate && options.probationEndDate < this.props.joinedDate) {
          throw new Error('Probation end date cannot be earlier than joining date');
        }
        this.props.probationEndDate = options.probationEndDate;
      }
    } else if (newStatus === EmployeeStatus.NOTICE_PERIOD || newStatus === EmployeeStatus.NOTICE) {
      const resDate = options?.resignationDate ?? new Date();
      if (this.props.joinedDate && resDate < this.props.joinedDate) {
        throw new Error('Resignation date cannot be earlier than joining date');
      }
      this.props.resignationDate = resDate;

      if (options?.lastWorkingDate) {
        if (options.lastWorkingDate < resDate) {
          throw new Error('Last working date cannot be earlier than resignation date');
        }
        this.props.lastWorkingDate = options.lastWorkingDate;
      }
      if (options?.noticePeriodDays !== undefined) {
        this.props.noticePeriodDays = options.noticePeriodDays;
      }
    } else if (newStatus === EmployeeStatus.RELIEVED) {
      const lwd = options?.lastWorkingDate ?? this.props.lastWorkingDate ?? new Date();
      if (this.props.resignationDate && lwd < this.props.resignationDate) {
        throw new Error('Last working date cannot be earlier than resignation date');
      }
      if (this.props.joinedDate && lwd < this.props.joinedDate) {
        throw new Error('Last working date cannot be earlier than joining date');
      }
      this.props.lastWorkingDate = lwd;
    } else if (newStatus === EmployeeStatus.JOINED) {
      if (options?.effectiveDate) {
        this.props.joinedDate = options.effectiveDate;
      }
    }

    this.props.status = newStatus;
    this._changeSets.push({
      field: 'STATUS_CHANGED',
      previous: previous,
      new: newStatus,
    });

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
        options?.notes,
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

  submitResignation(
    resignationDate: Date,
    reason: string,
    performedBy: string,
    noticePeriodDays?: number,
    lastWorkingDate?: Date,
  ): void {
    if (this.props.isDeleted) throw new Error('Cannot submit resignation for a deleted employee');
    if (this.props.status !== EmployeeStatus.CONFIRMED && this.props.status !== EmployeeStatus.ACTIVE) {
      throw new Error(`Only confirmed employees can submit resignation. Current status: ${this.props.status}`);
    }
    if (
      this.props.resignationStatus === ResignationStatus.SUBMITTED ||
      this.props.resignationStatus === ResignationStatus.ACCEPTED
    ) {
      throw new Error('An active resignation has already been submitted');
    }
    if (this.props.joinedDate && resignationDate < this.props.joinedDate) {
      throw new Error('Resignation date cannot be earlier than joining date');
    }
    const days = noticePeriodDays ?? this.props.noticePeriodDays ?? 30;
    const computedLwd = lastWorkingDate ?? new Date(resignationDate.getTime() + days * 24 * 60 * 60 * 1000);
    if (computedLwd < resignationDate) {
      throw new Error('Last working date cannot be earlier than resignation date');
    }

    this.props.resignationDate = resignationDate;
    this.props.resignationReason = reason;
    this.props.noticePeriodDays = days;
    this.props.lastWorkingDate = computedLwd;
    this.props.resignationStatus = ResignationStatus.SUBMITTED;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;

    this._changeSets.push({
      field: 'RESIGNATION_SUBMITTED',
      previous: null,
      new: `Submitted: ${resignationDate.toISOString().split('T')[0]}, LWD: ${computedLwd.toISOString().split('T')[0]}`,
    });
  }

  acceptResignation(performedBy: string, comments?: string, agreedLastWorkingDate?: Date): void {
    if (this.props.isDeleted) throw new Error('Cannot accept resignation for a deleted employee');
    if (this.props.resignationStatus !== ResignationStatus.SUBMITTED) {
      throw new Error(`Cannot accept resignation with status: ${this.props.resignationStatus ?? 'NONE'}`);
    }
    if (agreedLastWorkingDate) {
      if (this.props.resignationDate && agreedLastWorkingDate < this.props.resignationDate) {
        throw new Error('Last working date cannot be earlier than resignation date');
      }
      this.props.lastWorkingDate = agreedLastWorkingDate;
    }
    this.props.resignationStatus = ResignationStatus.ACCEPTED;

    this.transitionLifecycle(EmployeeStatus.NOTICE_PERIOD, performedBy, {
      resignationDate: this.props.resignationDate ?? undefined,
      lastWorkingDate: this.props.lastWorkingDate ?? undefined,
      noticePeriodDays: this.props.noticePeriodDays ?? undefined,
      notes: comments,
    });
  }

  withdrawResignation(performedBy: string, reason?: string): void {
    if (this.props.isDeleted) throw new Error('Cannot withdraw resignation for a deleted employee');
    if (this.props.status === EmployeeStatus.RELIEVED) {
      throw new Error('Cannot withdraw resignation after employee has been relieved');
    }
    if (
      this.props.resignationStatus !== ResignationStatus.SUBMITTED &&
      this.props.resignationStatus !== ResignationStatus.ACCEPTED
    ) {
      throw new Error(`Cannot withdraw resignation with status: ${this.props.resignationStatus ?? 'NONE'}`);
    }

    const previousResStatus = this.props.resignationStatus;
    this.props.resignationStatus = ResignationStatus.WITHDRAWN;

    if (this.props.status === EmployeeStatus.NOTICE_PERIOD || this.props.status === EmployeeStatus.NOTICE) {
      this.transitionLifecycle(EmployeeStatus.CONFIRMED, performedBy, {
        notes: reason ? `Resignation withdrawn: ${reason}` : 'Resignation withdrawn',
      });
    }

    this._changeSets.push({
      field: 'RESIGNATION_WITHDRAWN',
      previous: previousResStatus,
      new: ResignationStatus.WITHDRAWN,
    });
  }

  completeExit(performedBy: string, notes?: string, finalLastWorkingDate?: Date): void {
    if (this.props.isDeleted) throw new Error('Cannot complete exit for a deleted employee');
    if (this.props.resignationStatus !== ResignationStatus.ACCEPTED) {
      throw new Error('Resignation must be accepted before completing exit');
    }
    if (this.props.status !== EmployeeStatus.NOTICE_PERIOD && this.props.status !== EmployeeStatus.NOTICE) {
      throw new Error(`Employee must be in notice period to complete exit. Current status: ${this.props.status}`);
    }

    const lwd = finalLastWorkingDate ?? this.props.lastWorkingDate ?? new Date();
    if (this.props.resignationDate && lwd < this.props.resignationDate) {
      throw new Error('Last working date cannot be earlier than resignation date');
    }
    this.props.lastWorkingDate = lwd;
    this.props.resignationStatus = ResignationStatus.COMPLETED;

    this.transitionLifecycle(EmployeeStatus.RELIEVED, performedBy, {
      lastWorkingDate: lwd,
      notes: notes ?? 'Exit clearance completed and employee relieved',
    });
  }
}
