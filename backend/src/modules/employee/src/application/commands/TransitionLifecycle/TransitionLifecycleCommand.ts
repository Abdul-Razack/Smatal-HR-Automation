import { EmployeeStatus } from '../../../domain/enums/EmployeeStatus';

export class TransitionLifecycleCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly targetStatus: EmployeeStatus,
    public readonly effectiveDate?: Date,
    public readonly probationEndDate?: Date,
    public readonly confirmationDate?: Date,
    public readonly resignationDate?: Date,
    public readonly lastWorkingDate?: Date,
    public readonly noticePeriodDays?: number,
    public readonly notes?: string,
  ) {}
}
