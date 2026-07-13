import { IQuery } from '../../../../../../kernel/cqrs/cqrs.contracts';
import { CandidateStatus } from '../../../domain/enums/CandidateStatus';

export class ListCandidatesQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly status?: CandidateStatus,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly sortField: string = 'createdAt',
    public readonly sortDirection: 'asc' | 'desc' = 'desc',
  ) {}
}
