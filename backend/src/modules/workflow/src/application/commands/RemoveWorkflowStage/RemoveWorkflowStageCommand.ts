export class RemoveWorkflowStageCommand {
  constructor(
    public readonly definitionId: string,
    public readonly stageId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
