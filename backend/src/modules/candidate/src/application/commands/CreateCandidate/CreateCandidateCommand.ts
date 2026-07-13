import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class CreateCandidateCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly profileId: string,
    public readonly performedBy: string,
    public readonly source?: string | null,
    public readonly referredBy?: string | null,
    public readonly notes?: string | null,
    public readonly appliedDate?: Date | null,
  ) {}
}
