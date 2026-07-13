import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
export class DeleteEmployeeCommand implements ICommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
