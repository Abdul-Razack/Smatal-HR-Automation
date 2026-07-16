import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class UpdateCandidateCommand implements ICommand {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly notes?: string | null,
    public readonly source?: string | null,
    public readonly referredBy?: string | null,
    public readonly appliedDate?: Date | null,
    public readonly dynamicFields?: { fieldDefinitionId: string; value: any }[],
  ) {}
}
