import { ICommand } from '@smatal/kernel/cqrs/cqrs.contracts';

export class RemoveCompanyBrandingCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly userRole: string,
    public readonly type: 'logo' | 'signature',
  ) {}
}
