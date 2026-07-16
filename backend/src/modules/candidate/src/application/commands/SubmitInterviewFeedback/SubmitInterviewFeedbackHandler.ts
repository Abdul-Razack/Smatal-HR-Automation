import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubmitInterviewFeedbackCommand } from './SubmitInterviewFeedbackCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IInterviewRepository } from '../../../domain/repositories/IInterviewRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { InterviewFeedbackEntity } from '../../../domain/entities/InterviewFeedbackEntity';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { InterviewStatus } from '../../../domain/enums/InterviewStatus';

@CommandHandler(SubmitInterviewFeedbackCommand)
@Injectable()
export class SubmitInterviewFeedbackHandler implements ICommandHandler<SubmitInterviewFeedbackCommand> {
  constructor(
    @Inject('IInterviewRepository')
    private readonly interviewRepository: IInterviewRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: SubmitInterviewFeedbackCommand): Promise<Result<void>> {
    try {
      const interview = await this.interviewRepository.findById(command.interviewId);
      if (!interview || interview.companyId.toString() !== command.companyId) {
        throw new Error('Interview not found');
      }

      if (interview.status !== InterviewStatus.COMPLETED) {
        interview.transitionStatus(InterviewStatus.COMPLETED, command.performedBy);
      }

      const feedbackId = new Identifier(crypto.randomUUID());
      const feedback = InterviewFeedbackEntity.create(
        {
          companyId: command.companyId,
          interviewerId: command.interviewerId,
          rating: command.rating,
          comments: command.comments,
          recommendation: command.recommendation,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        feedbackId,
      );

      interview.submitFeedback(feedback, command.performedBy);

      await this.unitOfWork.withTransaction(async () => {
        await this.interviewRepository.save(interview);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
