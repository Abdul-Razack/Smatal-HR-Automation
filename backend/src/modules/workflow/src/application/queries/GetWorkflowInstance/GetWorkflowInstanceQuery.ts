export class GetWorkflowInstanceQuery {
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
  ) {}
}
