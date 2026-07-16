export class GetLeaveWorkflowQuery {
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
  ) {}
}
