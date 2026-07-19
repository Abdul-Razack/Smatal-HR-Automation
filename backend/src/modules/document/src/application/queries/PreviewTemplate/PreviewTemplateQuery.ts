export class PreviewTemplateQuery {
  constructor(
    public readonly templateId: string,
    public readonly companyId: string,
    public readonly mode: 'SAMPLE' | 'LIVE',
    public readonly format: 'HTML' | 'PDF',
    public readonly candidateId?: string,
    public readonly employeeId?: string,
  ) {}
}
