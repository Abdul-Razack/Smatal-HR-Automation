export class UpdateDocumentTypeStatusCommand {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly isActive: boolean,
    public readonly performedBy: string,
  ) {}
}
