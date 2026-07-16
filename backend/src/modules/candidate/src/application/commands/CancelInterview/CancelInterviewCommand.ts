import { ICommand } from '@nestjs/cqrs';

export class CancelInterviewCommand implements ICommand {
  constructor(
    public readonly interviewId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
