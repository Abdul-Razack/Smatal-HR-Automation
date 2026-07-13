import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';
import { EmployeeStatus } from '../../../domain/enums/EmployeeStatus';
export class ListEmployeesQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly status?: EmployeeStatus,
    public readonly departmentId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortField: string = 'createdAt',
    public readonly sortDirection: 'asc' | 'desc' = 'desc',
  ) {}
}
