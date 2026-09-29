import { ClearanceDepartment, ClearanceStatus } from '../../../domain/enums/ResignationEnums';

export class UpdateClearanceCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly department: ClearanceDepartment,
    public readonly status: ClearanceStatus,
    public readonly remarks?: string,
  ) {}
}
