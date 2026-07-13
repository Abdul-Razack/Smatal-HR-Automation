import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class CreateFieldGroupCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly name: string,
    public readonly performedBy: string,
    public readonly description?: string,
    public readonly displayOrder?: number,
  ) {}
}
