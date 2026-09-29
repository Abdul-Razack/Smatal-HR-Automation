export class AcceptResignationCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly comments?: string,
    public readonly agreedLastWorkingDate?: Date,
  ) {}
}
