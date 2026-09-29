export class WithdrawResignationCommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly userRole: string,
    public readonly reason?: string,
  ) {}
}
