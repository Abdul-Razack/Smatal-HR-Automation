import { IRepository } from '../../../../../kernel/repositories/repository.contracts';
import { LeaveBalance } from '../entities/LeaveBalance';

export interface ILeaveBalanceRepository extends IRepository<LeaveBalance> {
  findByEmployeeId(employeeId: string, year: number): Promise<LeaveBalance[]>;
  findSpecificBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveBalance | null>;
}
