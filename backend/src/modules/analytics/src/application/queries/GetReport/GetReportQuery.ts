export class GetReportQuery {
  constructor(
    public readonly companyId: string,
    public readonly reportType: string,
    public readonly filters: any,
  ) {}
}
