import { CompositeSpecification } from '../../../../../kernel/specifications/specification';
import { CandidateAggregate } from '../aggregates/CandidateAggregate';
import { CandidateStatus } from '../enums/CandidateStatus';

export class CandidateIsActiveSpecification extends CompositeSpecification<CandidateAggregate> {
  isSatisfiedBy(candidate: CandidateAggregate): boolean {
    return !candidate.isDeleted;
  }
}

export class CandidateIsConvertibleSpecification extends CompositeSpecification<CandidateAggregate> {
  isSatisfiedBy(candidate: CandidateAggregate): boolean {
    return (
      candidate.status === CandidateStatus.SELECTED && !candidate.isDeleted
    );
  }
}

export class CandidateIsInProgressSpecification extends CompositeSpecification<CandidateAggregate> {
  isSatisfiedBy(candidate: CandidateAggregate): boolean {
    const inProgressStatuses: CandidateStatus[] = [
      CandidateStatus.DRAFT,
      CandidateStatus.APPLIED,
      CandidateStatus.SCREENING,
      CandidateStatus.INTERVIEWING,
      CandidateStatus.SELECTED,
    ];
    return (
      inProgressStatuses.includes(candidate.status) && !candidate.isDeleted
    );
  }
}

export class CandidateBelongsToCompanySpecification extends CompositeSpecification<CandidateAggregate> {
  constructor(private readonly companyId: string) {
    super();
  }

  isSatisfiedBy(candidate: CandidateAggregate): boolean {
    return candidate.companyId.toString() === this.companyId;
  }
}
