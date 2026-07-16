import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
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
    public readonly dynamicFields?: { fieldDefinitionId: string; value: any }[],
  ) {}
}
