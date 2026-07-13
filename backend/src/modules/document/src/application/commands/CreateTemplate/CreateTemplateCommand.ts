export class CreateTemplateCommand {
  constructor(
    public readonly companyId: string,
    public readonly documentTypeId: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly performedBy: string,
  ) {}
}
