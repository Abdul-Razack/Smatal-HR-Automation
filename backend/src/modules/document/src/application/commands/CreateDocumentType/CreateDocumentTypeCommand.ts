export class CreateDocumentTypeCommand {
  constructor(
    public readonly companyId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly description: string | undefined,
    public readonly performedBy: string,
  ) {}
}
