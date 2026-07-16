import { IDomainEvent } from '../../../../../kernel/domain/DomainEvent';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export class LeaveAppliedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly leaveTypeId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

export class LeaveUpdatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

export class LeaveCancelledEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

export class LeaveDeletedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

// --- NEW EVENTS FOR PHASE 3 ---

export class LeaveApprovedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

export class LeaveRejectedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly reason: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

export class LeaveEscalatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

export class LeaveBalanceUpdatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly leaveTypeId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}

export class LeaveWorkflowCompletedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.leaveRequestId);
  }
}
