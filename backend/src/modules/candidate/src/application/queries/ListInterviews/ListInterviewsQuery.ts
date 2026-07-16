import { IQuery } from '@nestjs/cqrs';

export class ListInterviewsQuery implements IQuery {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
  ) {}
}
