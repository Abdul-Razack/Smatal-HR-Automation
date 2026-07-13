import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
export class WithdrawCandidateCommand implements ICommand {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly reason?: string,
  ) {}
}
