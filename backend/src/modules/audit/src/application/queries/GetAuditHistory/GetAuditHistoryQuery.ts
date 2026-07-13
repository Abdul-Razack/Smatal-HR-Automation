export class GetAuditHistoryQuery {
  constructor(
    public readonly companyId: string,
    public readonly entityBusinessId?: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
