import { DomainException } from '../../../../../kernel/domain/DomainException';

export class CandidateNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Candidate not found: ${id}`, 'NOT_FOUND');
  }
}

export class CandidateAlreadyExistsException extends DomainException {
  constructor(profileId: string, companyId: string) {
    super(
      `Candidate already exists for profile ${profileId} in company ${companyId}`,
      'CONFLICT',
    );
  }
}

export class InvalidCandidateStatusTransitionException extends DomainException {
  constructor(from: string, to: string) {
    super(
      `Cannot transition candidate status from ${from} to ${to}`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class CandidateAlreadyConvertedException extends DomainException {
  constructor(candidateId: string) {
    super(
      `Candidate ${candidateId} has already been converted to an employee`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class CandidateNotSelectedException extends DomainException {
  constructor(candidateId: string) {
    super(
      `Candidate ${candidateId} must be in SELECTED status before conversion`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}
