import { IQuery } from '@nestjs/cqrs';

export class GetCandidateOffersQuery implements IQuery {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
  ) {}
}
