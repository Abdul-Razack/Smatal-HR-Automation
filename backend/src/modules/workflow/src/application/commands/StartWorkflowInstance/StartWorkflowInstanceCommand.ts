export class StartWorkflowInstanceCommand {
  constructor(
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly workflowDefinitionId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly candidateId?: string,
    public readonly employeeId?: string,
  ) {}
}
