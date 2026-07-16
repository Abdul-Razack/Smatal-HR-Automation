import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';
import { LeaveStatus } from '../../../domain/enums/LeaveEnums';

export class ListLeavesQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly employeeId?: string,
    public readonly leaveTypeId?: string,
    public readonly status?: LeaveStatus,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortField: string = 'createdAt',
    public readonly sortDirection: 'asc' | 'desc' = 'desc',
  ) {}
}
