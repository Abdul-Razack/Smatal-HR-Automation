export interface GenerationContext {
  actionId: string;
  effectiveDate?: Date;
  initiatedBy: string;
  workflowId?: string;
}

export class GenerateDocumentCommand {
  constructor(
    public readonly companyId: string,
    public readonly documentTypeId: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly context: GenerationContext,
    public readonly performedBy: string,
  ) {}
}
