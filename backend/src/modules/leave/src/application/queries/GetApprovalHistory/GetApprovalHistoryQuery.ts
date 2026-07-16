export class GetApprovalHistoryQuery {
  constructor(
    public readonly workflowInstanceId: string,
    public readonly companyId: string,
  ) {}
}
