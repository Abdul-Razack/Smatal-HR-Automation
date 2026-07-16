import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class GetLeaveByIdQuery implements IQuery {
  constructor(
    public readonly leaveRequestId: string,
    public readonly companyId: string,
  ) {}
}
