import { IDomainEvent } from '../../../../../kernel/domain/DomainEvent';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { CandidateStatus } from '../enums/CandidateStatus';

// ─── Candidate Created ────────────────────────────────────────────────────────

export class CandidateCreatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();

  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly profileId: string,
    public readonly businessId: string,
    public readonly performedBy: string,
  ) {}

  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.candidateId);
  }
}

// ─── Candidate Updated ────────────────────────────────────────────────────────

export class CandidateUpdatedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();

  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}

  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.candidateId);
  }
}

// ─── Candidate Status Changed ─────────────────────────────────────────────────

export class CandidateStatusChangedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();

  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly previousStatus: CandidateStatus,
    public readonly newStatus: CandidateStatus,
    public readonly performedBy: string,
    public readonly reason?: string,
  ) {}

  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.candidateId);
  }
}

// ─── Candidate Converted ──────────────────────────────────────────────────────

export class CandidateConvertedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();

  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly profileId: string,
    public readonly employeeId: string,
    public readonly performedBy: string,
  ) {}

  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.candidateId);
  }
}

// ─── Candidate Deleted ────────────────────────────────────────────────────────

export class CandidateDeletedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date = new Date();

  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}

  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.candidateId);
  }
}
