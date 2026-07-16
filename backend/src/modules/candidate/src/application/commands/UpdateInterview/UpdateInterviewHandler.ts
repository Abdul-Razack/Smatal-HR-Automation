import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateInterviewCommand } from './UpdateInterviewCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IInterviewRepository } from '../../../domain/repositories/IInterviewRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(UpdateInterviewCommand)
@Injectable()
export class UpdateInterviewHandler implements ICommandHandler<UpdateInterviewCommand> {
  constructor(
    @Inject('IInterviewRepository')
    private readonly interviewRepository: IInterviewRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: UpdateInterviewCommand): Promise<Result<void>> {
    try {
      const interview = await this.interviewRepository.findById(command.interviewId);
      if (!interview || interview.companyId.toString() !== command.companyId) {
        throw new Error('Interview not found');
      }

      interview.update(
        command.title,
        command.description,
        command.type,
        command.scheduledAt,
        command.durationMinutes,
        command.meetingLink,
        command.location,
        command.interviewerIds,
        command.performedBy,
      );

      await this.unitOfWork.withTransaction(async () => {
        await this.interviewRepository.save(interview);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
