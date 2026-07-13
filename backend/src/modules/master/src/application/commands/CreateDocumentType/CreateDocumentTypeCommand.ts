import { ICommand } from '../../../../../../kernel/cqrs/cqrs.contracts';

export class CreateDocumentTypeCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly performedBy: string,
    public readonly description?: string,
  ) {}
}
