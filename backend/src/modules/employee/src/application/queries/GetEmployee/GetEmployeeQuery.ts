import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';
export class GetEmployeeQuery implements IQuery {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
  ) {}
}
