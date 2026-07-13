export class GetGeneratedDocumentQuery {
  constructor(
    public readonly companyId: string,
    public readonly documentId: string,
  ) {}
}
