export class AdvanceWorkflowStageCommand {
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly nextStageId: string,
    public readonly remarks?: string,
  ) {}
}
