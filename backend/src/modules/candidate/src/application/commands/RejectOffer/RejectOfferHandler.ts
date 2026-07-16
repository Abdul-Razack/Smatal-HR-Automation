import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectOfferCommand } from './RejectOfferCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IOfferRepository } from '../../../domain/repositories/IOfferRepository';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(RejectOfferCommand)
@Injectable()
export class RejectOfferHandler implements ICommandHandler<RejectOfferCommand> {
  constructor(
    @Inject('IOfferRepository')
    private readonly offerRepository: IOfferRepository,
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: RejectOfferCommand): Promise<Result<void>> {
    try {
      const offer = await this.offerRepository.findById(command.offerId);
      if (!offer || offer.companyId.toString() !== command.companyId) {
        throw new Error('Offer not found');
      }

      offer.reject(command.performedBy);

      // (Later Phase): We might want to auto-reject the candidate here as well.
      // But for now, just the offer is rejected.

      await this.unitOfWork.withTransaction(async () => {
        await this.offerRepository.save(offer);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
