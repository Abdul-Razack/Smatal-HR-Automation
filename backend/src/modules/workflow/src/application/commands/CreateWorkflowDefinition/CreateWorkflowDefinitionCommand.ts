export class CreateWorkflowDefinitionCommand {
  constructor(
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly name: string,
    public readonly entityType: string,
    public readonly description?: string,
    public readonly processCode?: string,
  ) {}
}
