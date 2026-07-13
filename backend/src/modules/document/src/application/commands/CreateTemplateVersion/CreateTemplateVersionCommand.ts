export class CreateTemplateVersionCommand {
  constructor(
    public readonly templateId: string,
    public readonly companyId: string,
    public readonly content: string,
    public readonly contentType: string,
    public readonly placeholders: {
      fieldDefinitionId: string;
      placeholderKey: string;
      isRequired: boolean;
      displayOrder: number;
    }[],
    public readonly notes: string | undefined,
    public readonly performedBy: string,
  ) {}
}
