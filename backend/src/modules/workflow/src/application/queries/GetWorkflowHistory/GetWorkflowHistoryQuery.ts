export class GetWorkflowHistoryQuery {
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
  ) {}
}
