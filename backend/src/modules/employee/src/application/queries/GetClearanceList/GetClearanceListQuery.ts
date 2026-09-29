export class GetClearanceListQuery {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
  ) {}
}
