export class UpdateDocumentTypeCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly name: string,
    public readonly description: string | null | undefined,
    public readonly performedBy: string,
  ) {}
}
