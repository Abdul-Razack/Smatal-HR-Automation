import {
  BaseBusinessEntity,
  BaseBusinessEntityProps,
} from './BaseBusinessEntity';
import { ITenantIsolated } from './ITenantIsolated';
import { Identifier } from '../Identifier';

export interface TenantIsolatedEntityProps extends BaseBusinessEntityProps {
  companyId: Identifier<string>;
}

/**
 * The root abstract class for all Tenant-Specific Business Entities
 * (e.g., Employee, Candidate, Department).
 * Strictly enforces that the entity belongs to a specific Company.
 */
export abstract class TenantIsolatedEntity<T extends TenantIsolatedEntityProps>
  extends BaseBusinessEntity<T>
  implements ITenantIsolated
{
  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
}
