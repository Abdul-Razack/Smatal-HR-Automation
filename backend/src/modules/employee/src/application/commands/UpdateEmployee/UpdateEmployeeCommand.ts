import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
import { DynamicFieldUpdateRequest } from '../../dto/requests/EmployeeRequests';

export class UpdateEmployeeCommand implements ICommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly departmentId?: string | null,
    public readonly designationId?: string | null,
    public readonly branchId?: string | null,
    public readonly reportsToId?: string | null,
    public readonly employeeNumber?: string | null,
    public readonly dynamicFields?: DynamicFieldUpdateRequest[],
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly personalEmail?: string,
    public readonly phone?: string,
    public readonly address?: string,
    public readonly dateOfBirth?: Date,
    public readonly gender?: string,
    public readonly employmentType?: string,
    public readonly salary?: number,
    public readonly joinedDate?: Date,
  ) {}
}
