export class SubmitResignationCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly userRole: string,
    public readonly resignationDate: Date,
    public readonly reason: string,
    public readonly noticePeriodDays?: number,
    public readonly lastWorkingDate?: Date,
  ) {}
}
