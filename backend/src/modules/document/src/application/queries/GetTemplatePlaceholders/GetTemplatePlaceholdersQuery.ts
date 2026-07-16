export class GetTemplatePlaceholdersQuery {
  constructor(
    public readonly templateId: string,
    public readonly versionId: string,
    public readonly companyId: string,
  ) {}
}
