export class GetAllTemplatesQuery {
  constructor(
    public readonly companyId: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly sort?: string,
    public readonly order?: 'asc' | 'desc',
    public readonly search?: string,
    public readonly documentTypeId?: string,
    public readonly status?: string,
  ) {}
}
