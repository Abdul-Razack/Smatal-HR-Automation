import { Injectable } from '@nestjs/common';
import { CandidateAggregate } from '../aggregates/CandidateAggregate';
import { ICandidateRepository } from '../repositories/ICandidateRepository';
import {
  CandidateAlreadyExistsException,
  CandidateNotFoundException,
} from '../exceptions/CandidateExceptions';
import { CandidateIsConvertibleSpecification } from '../specifications/CandidateSpecifications';

@Injectable()
export class CandidateDomainService {
  /**
   * Validates that a new Candidate can be created for the given profile+company.
   * Enforces the uniqueness rule: one candidate per profile per company.
   */
  async validateCreate(
    repository: ICandidateRepository,
    profileId: string,
    companyId: string,
  ): Promise<void> {
    const exists = await repository.existsByProfileAndCompany(
      profileId,
      companyId,
    );
    if (exists) {
      throw new CandidateAlreadyExistsException(profileId, companyId);
    }
  }

  /**
   * Validates that a candidate is eligible for conversion to an employee.
   * Checks status, deletion, and company isolation.
   */
  validateConvertibility(candidate: CandidateAggregate): void {
    const spec = new CandidateIsConvertibleSpecification();
    if (!spec.isSatisfiedBy(candidate)) {
      throw new Error(
        `Candidate ${candidate.businessId} is not eligible for conversion. ` +
          `Current status: ${candidate.status}`,
      );
    }
  }

  /**
   * Ensure the candidate belongs to the requesting company.
   */
  assertBelongsToCompany(
    candidate: CandidateAggregate,
    companyId: string,
  ): void {
    if (candidate.companyId.toString() !== companyId) {
      throw new CandidateNotFoundException(candidate.id.toString());
    }
  }
}
