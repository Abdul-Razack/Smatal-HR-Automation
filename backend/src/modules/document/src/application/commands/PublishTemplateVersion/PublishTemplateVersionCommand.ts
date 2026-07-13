export class PublishTemplateVersionCommand {
  constructor(
    public readonly templateId: string,
    public readonly versionId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
