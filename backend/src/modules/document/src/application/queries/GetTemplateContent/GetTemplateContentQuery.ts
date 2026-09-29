export class GetTemplateContentQuery {
  constructor(
    public readonly templateId: string,
    public readonly companyId: string,
    public readonly versionId?: string,
  ) {}
}
