import { IQuery } from '@smatal/kernel/cqrs/cqrs.contracts';

export class GetCompanySettingsQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}
