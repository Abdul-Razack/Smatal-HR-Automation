import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class ConvertCandidateCommand implements ICommand {
  constructor(
    public readonly candidateId: string,
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly joinedDate: Date,
    public readonly departmentId?: string | null,
    public readonly designationId?: string | null,
    public readonly branchId?: string | null,
    public readonly reportsToId?: string | null,
    public readonly employeeNumber?: string | null,
    public readonly probationEndDate?: Date | null,
  ) {}
}
