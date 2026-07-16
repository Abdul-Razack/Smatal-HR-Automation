import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateOfferCommand } from './UpdateOfferCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IOfferRepository } from '../../../domain/repositories/IOfferRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(UpdateOfferCommand)
@Injectable()
export class UpdateOfferHandler implements ICommandHandler<UpdateOfferCommand> {
  constructor(
    @Inject('IOfferRepository')
    private readonly offerRepository: IOfferRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: UpdateOfferCommand): Promise<Result<void>> {
    try {
      const offer = await this.offerRepository.findById(command.offerId);
      if (!offer || offer.companyId.toString() !== command.companyId) {
        throw new Error('Offer not found');
      }

      offer.update(
        command.baseSalary,
        command.currency,
        command.joiningDate,
        command.validUntil,
        command.notes,
        command.performedBy,
      );

      await this.unitOfWork.withTransaction(async () => {
        await this.offerRepository.save(offer);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
