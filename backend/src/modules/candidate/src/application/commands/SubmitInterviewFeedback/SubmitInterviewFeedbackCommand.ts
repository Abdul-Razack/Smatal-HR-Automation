import { ICommand } from '@nestjs/cqrs';

export class SubmitInterviewFeedbackCommand implements ICommand {
  constructor(
    public readonly interviewId: string,
    public readonly companyId: string,
    public readonly interviewerId: string,
    public readonly rating: number,
    public readonly comments: string,
    public readonly recommendation: string,
    public readonly performedBy: string,
  ) {}
}
