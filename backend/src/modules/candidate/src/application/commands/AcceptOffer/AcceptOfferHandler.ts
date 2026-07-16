import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AcceptOfferCommand } from './AcceptOfferCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IOfferRepository } from '../../../domain/repositories/IOfferRepository';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(AcceptOfferCommand)
@Injectable()
export class AcceptOfferHandler implements ICommandHandler<AcceptOfferCommand> {
  constructor(
    @Inject('IOfferRepository')
    private readonly offerRepository: IOfferRepository,
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: AcceptOfferCommand): Promise<Result<void>> {
    try {
      const offer = await this.offerRepository.findById(command.offerId);
      if (!offer || offer.companyId.toString() !== command.companyId) {
        throw new Error('Offer not found');
      }

      offer.accept(command.performedBy);

      // (Later Phase): Offer Accepted could automatically trigger Employee conversion.
      // For now, we just mark the offer as accepted.

      await this.unitOfWork.withTransaction(async () => {
        await this.offerRepository.save(offer);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
