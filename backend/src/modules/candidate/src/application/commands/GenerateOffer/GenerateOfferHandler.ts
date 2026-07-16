import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateOfferCommand } from './GenerateOfferCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IOfferRepository } from '../../../domain/repositories/IOfferRepository';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { OfferAggregate } from '../../../domain/aggregates/OfferAggregate';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { OfferStatus } from '../../../domain/enums/OfferStatus';
import { CandidateNotFoundException } from '../../../domain/exceptions/CandidateExceptions';
import { CandidateStatus } from '../../../domain/enums/CandidateStatus';

@CommandHandler(GenerateOfferCommand)
@Injectable()
export class GenerateOfferHandler implements ICommandHandler<GenerateOfferCommand> {
  constructor(
    @Inject('IOfferRepository')
    private readonly offerRepository: IOfferRepository,
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: GenerateOfferCommand): Promise<Result<string>> {
    try {
      const candidate = await this.candidateRepository.findById(command.candidateId);
      if (!candidate || candidate.companyId.toString() !== command.companyId) {
        throw new CandidateNotFoundException(command.candidateId);
      }

      // Automatically transition candidate to SELECTED if generating offer
      if (candidate.status !== CandidateStatus.SELECTED && candidate.status !== CandidateStatus.CONVERTED) {
        candidate.select(command.performedBy);
      }

      const id = new Identifier(crypto.randomUUID());
      const businessId = `OFF-${Date.now().toString().slice(-6)}`;

      const offer = OfferAggregate.create(
        {
          businessId,
          companyId: new Identifier(command.companyId),
          candidateId: command.candidateId,
          status: OfferStatus.DRAFT,
          baseSalary: command.baseSalary,
          currency: command.currency,
          joiningDate: command.joiningDate,
          validUntil: command.validUntil,
          notes: command.notes,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        id,
        command.performedBy,
      );

      await this.unitOfWork.withTransaction(async () => {
        await this.candidateRepository.save(candidate);
        await this.offerRepository.save(offer);
      });

      return Result.ok<string>(id.toString());
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
