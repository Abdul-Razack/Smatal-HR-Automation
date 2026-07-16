import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelInterviewCommand } from './CancelInterviewCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IInterviewRepository } from '../../../domain/repositories/IInterviewRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(CancelInterviewCommand)
@Injectable()
export class CancelInterviewHandler implements ICommandHandler<CancelInterviewCommand> {
  constructor(
    @Inject('IInterviewRepository')
    private readonly interviewRepository: IInterviewRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: CancelInterviewCommand): Promise<Result<void>> {
    try {
      const interview = await this.interviewRepository.findById(command.interviewId);
      if (!interview || interview.companyId.toString() !== command.companyId) {
        throw new Error('Interview not found');
      }

      interview.cancel(command.performedBy);

      await this.unitOfWork.withTransaction(async () => {
        await this.interviewRepository.save(interview);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
