export class EscalateLeaveCommand {
  constructor(
    public readonly leaveRequestId: string,
    public readonly workflowInstanceId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly remarks?: string,
  ) {}
}
