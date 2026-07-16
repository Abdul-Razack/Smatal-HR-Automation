import { IQuery } from '@nestjs/cqrs';

export class GetInterviewQuery implements IQuery {
  constructor(
    public readonly interviewId: string,
    public readonly companyId: string,
  ) {}
}
