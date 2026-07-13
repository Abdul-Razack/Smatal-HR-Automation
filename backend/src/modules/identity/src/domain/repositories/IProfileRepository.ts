import { IRepository } from '@smatal/kernel/repositories/repository.contracts';
import { ProfileAggregate } from '../entities/ProfileAggregate';

export const PROFILE_REPOSITORY = Symbol('IProfileRepository');

export interface IProfileRepository extends IRepository<ProfileAggregate> {
  findByEmail(email: string): Promise<ProfileAggregate | null>;
}
