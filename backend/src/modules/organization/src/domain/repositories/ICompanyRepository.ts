import { IRepository } from '@smatal/kernel/repositories/repository.contracts';
import { CompanyAggregate } from '../entities/CompanyAggregate';

export const COMPANY_REPOSITORY = Symbol('ICompanyRepository');

export interface ICompanyRepository extends IRepository<CompanyAggregate> {
  findByCode(code: string): Promise<CompanyAggregate | null>;
}
