import { IRepository } from '@smatal/kernel/repositories/repository.contracts';
import { IdentityUserAggregate } from '../entities/IdentityUserAggregate';

export const IDENTITY_USER_REPOSITORY = Symbol('IIdentityUserRepository');

export interface IIdentityUserRepository extends IRepository<IdentityUserAggregate> {
  findByEmail(
    email: string,
    companyId: string,
  ): Promise<IdentityUserAggregate | null>;
  findActiveByCompany(companyId: string): Promise<IdentityUserAggregate[]>;
}
