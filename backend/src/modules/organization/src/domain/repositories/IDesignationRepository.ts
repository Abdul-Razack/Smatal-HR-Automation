import { IRepository } from '@smatal/kernel/repositories/repository.contracts';
import { DesignationEntity } from '../entities/DesignationEntity';

export const DESIGNATION_REPOSITORY = Symbol('IDesignationRepository');

export interface IDesignationRepository extends IRepository<DesignationEntity> {
  findByCode(
    code: string,
    companyId: string,
  ): Promise<DesignationEntity | null>;
}
