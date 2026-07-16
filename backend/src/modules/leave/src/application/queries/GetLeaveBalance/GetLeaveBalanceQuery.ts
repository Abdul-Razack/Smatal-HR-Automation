import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class GetLeaveBalanceQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly employeeId: string,
    public readonly year: number,
  ) {}
}
