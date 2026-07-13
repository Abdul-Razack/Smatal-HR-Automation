import { Identifier } from '../Identifier';

/**
 * Defines a contract for entities that strictly belong to a specific tenant (Company).
 * Prevents cross-tenant data leakage.
 */
export interface ITenantIsolated {
  /**
   * The unique identifier of the owning Company.
   */
  readonly companyId: Identifier<string>;
}
