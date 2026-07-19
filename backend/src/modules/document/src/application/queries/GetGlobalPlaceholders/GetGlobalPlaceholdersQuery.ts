import { IQuery } from '@nestjs/cqrs';

export class GetGlobalPlaceholdersQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly search?: string,
    public readonly entityFilter?: string,
  ) {}
}
