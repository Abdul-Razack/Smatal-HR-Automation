export class ReturnWorkflowStageCommand {
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly targetStageId: string,
    public readonly reason: string,
  ) {}
}
