export class GlobalSearchQuery {
  constructor(
    public readonly companyId: string,
    public readonly keyword: string,
    public readonly limit: number = 20,
  ) {}
}
