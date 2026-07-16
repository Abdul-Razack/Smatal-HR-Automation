import { IRepository } from '../../../../../kernel/repositories/repository.contracts';
import { LeaveType } from '../entities/LeaveType';

export interface ILeaveTypeRepository extends IRepository<LeaveType> {
  findByCompanyId(companyId: string): Promise<LeaveType[]>;
  findByCode(companyId: string, code: string): Promise<LeaveType | null>;
}
