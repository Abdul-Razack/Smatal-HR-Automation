export class ListDocumentTypesQuery {
  constructor(
    public readonly companyId: string,
    public readonly filters?: {
      search?: string;
      isActive?: boolean;
    },
  ) {}
}
