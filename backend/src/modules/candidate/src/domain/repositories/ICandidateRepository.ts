import {
  IRepository,
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';
import { CandidateAggregate } from '../aggregates/CandidateAggregate';
import { CandidateStatus } from '../enums/CandidateStatus';

export interface ICandidateRepository extends IRepository<CandidateAggregate> {
  /**
   * Find a candidate by business ID within a company (tenant isolation enforced).
   */
  findByBusinessId(businessId: string): Promise<CandidateAggregate | null>;

  /**
   * Find the candidate tied to a specific profile within a company.
   */
  findByProfileAndCompany(
    profileId: string,
    companyId: string,
  ): Promise<CandidateAggregate | null>;

  /**
   * List candidates for a company with optional status filter and pagination.
   */
  listByCompany(
    companyId: string,
    status?: CandidateStatus,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<CandidateAggregate>>;

  /**
   * Check if a profile already has a candidate record in the company.
   */
  existsByProfileAndCompany(
    profileId: string,
    companyId: string,
  ): Promise<boolean>;
}
