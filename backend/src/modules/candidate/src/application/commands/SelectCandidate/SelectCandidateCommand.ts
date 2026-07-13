import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';
export class SelectCandidateCommand implements ICommand {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
  ) {}
}
