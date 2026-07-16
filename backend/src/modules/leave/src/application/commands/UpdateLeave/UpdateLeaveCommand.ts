import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class UpdateLeaveCommand implements ICommand {
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly startDate?: string,
    public readonly endDate?: string,
    public readonly reason?: string,
    public readonly attachmentUrl?: string,
  ) {}
}
