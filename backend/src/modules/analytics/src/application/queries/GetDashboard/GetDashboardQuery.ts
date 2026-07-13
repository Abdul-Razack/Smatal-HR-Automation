export class GetDashboardQuery {
  constructor(
    public readonly companyId: string,
    public readonly dashboardType: 'HR' | 'ORG' | 'DOC',
  ) {}
}
