import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitCandidateCommand } from './SubmitCandidateCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { CandidateDomainService } from '../../../domain/services/CandidateDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { CandidateNotFoundException } from '../../../domain/exceptions/CandidateExceptions';

@CommandHandler(SubmitCandidateCommand)
@Injectable()
export class SubmitCandidateHandler implements ICommandHandler<SubmitCandidateCommand> {
  constructor(
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly candidateDomainService: CandidateDomainService,
  ) {}

  async execute(command: SubmitCandidateCommand): Promise<Result<void>> {
    try {
      const candidate = await this.candidateRepository.findById(
        command.candidateId,
      );
      if (!candidate) throw new CandidateNotFoundException(command.candidateId);
      this.candidateDomainService.assertBelongsToCompany(
        candidate,
        command.companyId,
      );
      candidate.submit(command.performedBy);
      await this.unitOfWork.withTransaction(async () => {
        await this.candidateRepository.save(candidate);
      });
      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
