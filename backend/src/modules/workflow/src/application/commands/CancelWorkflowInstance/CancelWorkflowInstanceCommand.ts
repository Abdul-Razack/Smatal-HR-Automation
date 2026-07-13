export class CancelWorkflowInstanceCommand {
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly reason: string,
  ) {}
}
