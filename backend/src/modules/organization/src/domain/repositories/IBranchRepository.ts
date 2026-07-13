import { IRepository } from '@smatal/kernel/repositories/repository.contracts';
import { BranchEntity } from '../entities/BranchEntity';

export const BRANCH_REPOSITORY = Symbol('IBranchRepository');

export interface IBranchRepository extends IRepository<BranchEntity> {
  findByCode(code: string, companyId: string): Promise<BranchEntity | null>;
  findHeadquarters(companyId: string): Promise<BranchEntity | null>;
}
