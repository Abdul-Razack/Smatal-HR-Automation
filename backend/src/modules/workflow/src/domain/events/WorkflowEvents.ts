import { IDomainEvent } from '../../../../../kernel/domain/DomainEvent';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { WorkflowInstanceStatus, WorkflowAction } from '../enums/WorkflowEnums';

// ─── WorkflowDefinition Events ───────────────────────────────────────────────

export class WorkflowDefinitionCreatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly definitionId: string,
    public readonly companyId: string,
    public readonly entityType: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.definitionId);
  }
}

export class WorkflowDefinitionPublishedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly definitionId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.definitionId);
  }
}

export class WorkflowDefinitionArchivedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly definitionId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.definitionId);
  }
}

export class WorkflowDefinitionUpdatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly definitionId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.definitionId);
  }
}

export class WorkflowStageAddedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly definitionId: string,
    public readonly stageCode: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.definitionId);
  }
}

export class WorkflowStageRemovedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly definitionId: string,
    public readonly stageId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.definitionId);
  }
}

// ─── WorkflowInstance Events ─────────────────────────────────────────────────

export class WorkflowInstanceStartedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly instanceId: string,
    public readonly businessId: string,
    public readonly companyId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly definitionId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.instanceId);
  }
}

export class WorkflowStageAdvancedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly previousStageId: string | null,
    public readonly newStageId: string,
    public readonly action: WorkflowAction,
    public readonly performedBy: string,
    public readonly remarks?: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.instanceId);
  }
}

export class WorkflowInstanceCompletedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.instanceId);
  }
}

export class WorkflowInstanceCancelledEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly reason: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.instanceId);
  }
}

export class WorkflowStageRejectedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly stageId: string,
    public readonly reason: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.instanceId);
  }
}

export class WorkflowStageReturnedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly targetStageId: string,
    public readonly reason: string,
    public readonly performedBy: string,
  ) {}
  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.instanceId);
  }
}
