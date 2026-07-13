export class ArchiveWorkflowDefinitionCommand {
  constructor(
    public readonly definitionId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
