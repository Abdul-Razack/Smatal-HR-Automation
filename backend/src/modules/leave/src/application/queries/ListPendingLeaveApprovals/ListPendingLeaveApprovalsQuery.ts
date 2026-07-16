import {
  IPaginationOptions,
  ISortOptions,
} from '../../../../../../kernel/repositories/repository.contracts';

export class ListPendingLeaveApprovalsQuery {
  constructor(
    public readonly companyId: string,
    public readonly approverEmployeeId?: string,
    public readonly pagination?: IPaginationOptions,
    public readonly sort?: ISortOptions,
  ) {}
}
