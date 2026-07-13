import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListCandidatesQuery } from './ListCandidatesQuery';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { IPaginatedResult } from '../../../../../../kernel/repositories/repository.contracts';
import { CandidateResponseDto } from '../../dto/responses/CandidateResponseDto';
import { CandidateMapper } from '../../../infrastructure/mappers/CandidateMapper';

@QueryHandler(ListCandidatesQuery)
@Injectable()
export class ListCandidatesHandler implements IQueryHandler<ListCandidatesQuery> {
  constructor(
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    private readonly candidateMapper: CandidateMapper,
  ) {}

  async execute(
    query: ListCandidatesQuery,
  ): Promise<IPaginatedResult<CandidateResponseDto>> {
    const result = await this.candidateRepository.listByCompany(
      query.companyId,
      query.status,
      { page: query.page, limit: query.limit },
      { field: query.sortField, direction: query.sortDirection },
    );

    return {
      ...result,
      data: result.data.map((c) => this.candidateMapper.toResponseDto(c)),
    };
  }
}
