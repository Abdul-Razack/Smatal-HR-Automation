import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ScheduleInterviewCommand } from './ScheduleInterviewCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IInterviewRepository } from '../../../domain/repositories/IInterviewRepository';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { InterviewAggregate } from '../../../domain/aggregates/InterviewAggregate';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { InterviewStatus } from '../../../domain/enums/InterviewStatus';
import { CandidateNotFoundException } from '../../../domain/exceptions/CandidateExceptions';

@CommandHandler(ScheduleInterviewCommand)
@Injectable()
export class ScheduleInterviewHandler implements ICommandHandler<ScheduleInterviewCommand> {
  constructor(
    @Inject('IInterviewRepository')
    private readonly interviewRepository: IInterviewRepository,
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: ScheduleInterviewCommand): Promise<Result<string>> {
    try {
      const candidate = await this.candidateRepository.findById(command.candidateId);
      if (!candidate || candidate.companyId.toString() !== command.companyId) {
        throw new CandidateNotFoundException(command.candidateId);
      }

      const id = new Identifier(crypto.randomUUID());
      const businessId = `INT-${Date.now().toString().slice(-6)}`;

      const interview = InterviewAggregate.create(
        {
          businessId,
          companyId: new Identifier(command.companyId),
          candidateId: command.candidateId,
          title: command.title,
          description: command.description,
          type: command.type,
          status: InterviewStatus.SCHEDULED,
          scheduledAt: command.scheduledAt,
          durationMinutes: command.durationMinutes,
          meetingLink: command.meetingLink,
          location: command.location,
          interviewerIds: command.interviewerIds,
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
        await this.interviewRepository.save(interview);
      });

      return Result.ok<string>(id.toString());
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
