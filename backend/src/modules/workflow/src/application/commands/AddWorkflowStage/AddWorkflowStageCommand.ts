export class AddWorkflowStageCommand {
  constructor(
    public readonly definitionId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly name: string,
    public readonly code: string,
    public readonly displayOrder: number,
    public readonly description?: string | null,
    public readonly isTerminal: boolean = false,
    public readonly isFinal: boolean = false,
  ) {}
}
