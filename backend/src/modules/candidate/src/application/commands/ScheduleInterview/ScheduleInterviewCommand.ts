import { ICommand } from '@nestjs/cqrs';
import { InterviewType } from '../../../domain/enums/InterviewType';

export class ScheduleInterviewCommand implements ICommand {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly title: string,
    public readonly description: string | null | undefined,
    public readonly type: InterviewType,
    public readonly scheduledAt: Date,
    public readonly durationMinutes: number,
    public readonly meetingLink: string | null | undefined,
    public readonly location: string | null | undefined,
    public readonly interviewerIds: string[],
    public readonly performedBy: string,
  ) {}
}
