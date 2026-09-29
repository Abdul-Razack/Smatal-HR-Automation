export class GetResignationQuery {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
  ) {}
}
