import { IRepository } from '@smatal/kernel/repositories/repository.contracts';
import { DepartmentEntity } from '../entities/DepartmentEntity';

export const DEPARTMENT_REPOSITORY = Symbol('IDepartmentRepository');

export interface IDepartmentRepository extends IRepository<DepartmentEntity> {
  findByCode(code: string, companyId: string): Promise<DepartmentEntity | null>;
  findByParentId(
    parentId: string,
    companyId: string,
  ): Promise<DepartmentEntity[]>;
}
