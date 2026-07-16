import { IDomainEvent } from '../../../../../kernel/domain/DomainEvent';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { EmployeeStatus } from '../enums/EmployeeStatus';

export class EmployeeCreatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly profileId: string,
    public readonly businessId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.employeeId);
  }
}

export class EmployeeUpdatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.employeeId);
  }
}

export class EmployeeStatusChangedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly previousStatus: EmployeeStatus,
    public readonly newStatus: EmployeeStatus,
    public readonly performedBy: string,
    public readonly reason?: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.employeeId);
  }
}

export class EmployeeTerminatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly terminationDate: Date,
    public readonly reason: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.employeeId);
  }
}

export class EmployeeDeletedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.employeeId);
  }
}

export class EmployeePromotedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly newDesignationId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.employeeId);
  }
}

export class EmployeeTransferredEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly newDepartmentId: string | null,
    public readonly newBranchId: string | null,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.employeeId);
  }
}
