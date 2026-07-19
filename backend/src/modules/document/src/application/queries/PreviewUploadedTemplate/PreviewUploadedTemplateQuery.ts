export class PreviewUploadedTemplateQuery {
  constructor(
    public readonly fileBuffer: Buffer,
    public readonly companyId: string,
    public readonly mode: 'SAMPLE' | 'LIVE',
    public readonly format: 'HTML' | 'PDF',
    public readonly candidateId?: string,
    public readonly employeeId?: string,
    public readonly contentType?: 'html' | 'docx',
  ) {}
}
