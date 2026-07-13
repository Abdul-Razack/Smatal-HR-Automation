import { IRepository } from '@smatal/kernel/repositories/repository.contracts';
import { RoleEntity } from '../entities/RoleEntity';

export const ROLE_REPOSITORY = Symbol('IRoleRepository');

export interface IRoleRepository extends IRepository<RoleEntity> {
  findByCode(code: string, companyId: string): Promise<RoleEntity | null>;
  findAllByCompany(companyId: string): Promise<RoleEntity[]>;
  findSystemRoles(): Promise<RoleEntity[]>;
}
