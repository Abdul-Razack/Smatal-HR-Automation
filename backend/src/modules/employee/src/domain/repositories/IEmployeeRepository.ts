import {
  IRepository,
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';
import { EmployeeAggregate } from '../aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../enums/EmployeeStatus';

export interface IEmployeeRepository extends IRepository<EmployeeAggregate> {
  findByProfileAndCompany(
    profileId: string,
    companyId: string,
  ): Promise<EmployeeAggregate | null>;
  listByCompany(
    companyId: string,
    status?: EmployeeStatus,
    departmentId?: string,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<EmployeeAggregate>>;
  existsByProfileAndCompany(
    profileId: string,
    companyId: string,
  ): Promise<boolean>;
}
