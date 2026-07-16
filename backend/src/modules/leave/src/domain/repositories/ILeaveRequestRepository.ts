import {
  IRepository,
  IPaginatedResult,
  IPaginationOptions,
  ISortOptions,
} from '../../../../../kernel/repositories/repository.contracts';
import { LeaveRequestAggregate } from '../aggregates/LeaveRequestAggregate';
import { LeaveStatus } from '../enums/LeaveEnums';

export interface ILeaveRequestRepository extends IRepository<LeaveRequestAggregate> {
  findOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LeaveRequestAggregate[]>;

  listWithFilters(
    companyId?: string,
    employeeId?: string,
    status?: LeaveStatus,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<LeaveRequestAggregate>>;
}
