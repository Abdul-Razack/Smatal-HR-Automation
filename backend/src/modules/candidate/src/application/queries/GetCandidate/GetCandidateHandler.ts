import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCandidateQuery } from './GetCandidateQuery';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { CandidateDomainService } from '../../../domain/services/CandidateDomainService';
import { CandidateNotFoundException } from '../../../domain/exceptions/CandidateExceptions';
import { CandidateResponseDto } from '../../dto/responses/CandidateResponseDto';
import { CandidateMapper } from '../../../infrastructure/mappers/CandidateMapper';

@QueryHandler(GetCandidateQuery)
@Injectable()
export class GetCandidateHandler implements IQueryHandler<GetCandidateQuery> {
  constructor(
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    private readonly candidateDomainService: CandidateDomainService,
    private readonly candidateMapper: CandidateMapper,
  ) {}

  async execute(query: GetCandidateQuery): Promise<CandidateResponseDto> {
    const candidate = await this.candidateRepository.findById(
      query.candidateId,
    );
    if (!candidate) throw new CandidateNotFoundException(query.candidateId);
    this.candidateDomainService.assertBelongsToCompany(
      candidate,
      query.companyId,
    );
    return this.candidateMapper.toResponseDto(candidate);
  }
}
