import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';
export class GetCandidateQuery implements IQuery {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
  ) {}
}
