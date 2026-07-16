import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class ApplyLeaveCommand implements ICommand {
  constructor(
    public readonly employeeId: string,
    public readonly companyId: string,
    public readonly leaveTypeId: string,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly reason: string,
    public readonly performedBy: string,
    public readonly attachmentUrl?: string,
    public readonly durationDays?: number,
    public readonly isHalfDay?: boolean,
  ) {}
}
