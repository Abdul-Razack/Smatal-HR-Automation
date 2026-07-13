import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
export class TerminateEmployeeCommand implements ICommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly terminationDate: Date,
    public readonly reason: string,
  ) {}
}
