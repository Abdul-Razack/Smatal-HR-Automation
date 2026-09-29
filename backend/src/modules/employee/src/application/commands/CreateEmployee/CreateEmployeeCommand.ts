import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
import { EmployeeStatus } from '../../../domain/enums/EmployeeStatus';
import { DynamicFieldUpdateRequest } from '../../dto/requests/EmployeeRequests';

export class CreateEmployeeCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly personalEmail: string,
    public readonly joinedDate: Date,
    public readonly phone?: string,
    public readonly address?: string,
    public readonly dateOfBirth?: Date,
    public readonly gender?: string,
    public readonly departmentId?: string,
    public readonly designationId?: string,
    public readonly branchId?: string,
    public readonly reportsToId?: string,
    public readonly employeeNumber?: string,
    public readonly employmentType?: string,
    public readonly salary?: number,
    public readonly status?: EmployeeStatus,
    public readonly probationEndDate?: Date,
    public readonly dynamicFields?: DynamicFieldUpdateRequest[],
  ) {}
}
