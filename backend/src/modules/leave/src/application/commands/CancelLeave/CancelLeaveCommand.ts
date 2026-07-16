import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class CancelLeaveCommand implements ICommand {
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly reason: string,
  ) {}
}
