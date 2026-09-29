import { ICommand } from '@smatal/kernel/cqrs/cqrs.contracts';
import { UpdateCompanySettingsDto } from '../dtos/CompanySettingsDtos';

export class UpdateCompanySettingsCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly performedBy: string,
    public readonly userRole: string,
    public readonly data: UpdateCompanySettingsDto,
  ) {}
}
