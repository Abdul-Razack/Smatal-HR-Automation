import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class ListHolidaysQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly year: number,
  ) {}
}
