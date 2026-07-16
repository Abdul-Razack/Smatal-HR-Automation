import { IRepository } from '../../../../../kernel/repositories/repository.contracts';
import { EmploymentHistoryEntity } from '../entities/EmploymentHistoryEntity';

export interface IEmploymentHistoryRepository extends IRepository<EmploymentHistoryEntity> {
  findByEmployee(employeeId: string, companyId: string): Promise<EmploymentHistoryEntity[]>;
}
