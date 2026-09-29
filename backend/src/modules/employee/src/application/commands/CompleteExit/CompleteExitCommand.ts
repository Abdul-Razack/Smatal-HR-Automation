export class CompleteExitCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly finalLastWorkingDate?: Date,
    public readonly notes?: string,
  ) {}
}
