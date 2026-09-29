export class SaveHtmlTemplateVersionCommand {
  constructor(
    public readonly templateId: string,
    public readonly companyId: string,
    public readonly content: string,
    public readonly notes: string | undefined,
    public readonly performedBy: string,
  ) {}
}
