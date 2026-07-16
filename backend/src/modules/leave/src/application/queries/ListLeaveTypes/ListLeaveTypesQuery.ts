import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class ListLeaveTypesQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}
