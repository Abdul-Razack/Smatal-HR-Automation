export class ApproveWorkflowStageCommand {
  constructor(
    public readonly instanceId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly remarks?: string,
  ) {}
}
