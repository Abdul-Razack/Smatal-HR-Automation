import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCandidateCommand } from './CreateCandidateCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { CandidateDomainService } from '../../../domain/services/CandidateDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { CandidateAggregate } from '../../../domain/aggregates/CandidateAggregate';
import { CandidateStatus } from '../../../domain/enums/CandidateStatus';
import { Identifier } from '../../../../../../kernel/domain/Identifier';

@CommandHandler(CreateCandidateCommand)
@Injectable()
export class CreateCandidateHandler implements ICommandHandler<CreateCandidateCommand> {
  constructor(
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly businessIdGenerator: IBusinessIdGenerator,
    private readonly candidateDomainService: CandidateDomainService,
  ) {}

  async execute(command: CreateCandidateCommand): Promise<Result<string>> {
    try {
      // 1. Domain rule: one candidate per profile per company
      await this.candidateDomainService.validateCreate(
        this.candidateRepository,
        command.profileId,
        command.companyId,
      );

      // 2. Generate business ID: CAND_000001
      const businessId = await this.businessIdGenerator.generate('CAND');

      // 3. Build aggregate
      const candidateId = new Identifier<string>(crypto.randomUUID());
      const candidate = CandidateAggregate.create(
        {
          businessId,
          companyId: new Identifier<string>(command.companyId),
          profileId: command.profileId,
          status: CandidateStatus.DRAFT,
          source: command.source ?? null,
          referredBy: command.referredBy ?? null,
          notes: command.notes ?? null,
          appliedDate: command.appliedDate ?? null,
          version: 1,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        candidateId,
        command.performedBy,
      );

      // 4. Persist within UoW
      await this.unitOfWork.withTransaction(async () => {
        await this.candidateRepository.save(candidate);
      });

      return Result.ok<string>(candidate.id.toString());
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
