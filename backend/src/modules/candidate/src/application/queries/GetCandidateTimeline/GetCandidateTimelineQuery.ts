import { IQuery } from '@nestjs/cqrs';

export class GetCandidateTimelineQuery implements IQuery {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
  ) {}
}
