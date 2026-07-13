export class UpdateWorkflowDefinitionCommand {
  constructor(
    public readonly definitionId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly name?: string,
    public readonly description?: string | null,
  ) {}
}
