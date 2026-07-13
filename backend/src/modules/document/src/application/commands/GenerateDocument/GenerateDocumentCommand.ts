export class GenerateDocumentCommand {
  constructor(
    public readonly companyId: string,
    public readonly profileId: string,
    public readonly templateId: string,
    public readonly performedBy: string,
    public readonly candidateId?: string | null,
    public readonly employeeId?: string | null,
    public readonly workflowInstanceId?: string | null,
    public readonly workflowStageId?: string | null,
  ) {}
}
