import { ICommand } from '@smatal/kernel/cqrs/cqrs.contracts';

export class CreateCompanyCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly requestedBy: string,
    public readonly website?: string,
    public readonly industry?: string,
    public readonly registrationNumber?: string,
    public readonly taxNumber?: string,
  ) {}
}

export class CreateBranchCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly isHeadquarters: boolean,
    public readonly requestedBy: string,
    public readonly addressLine1?: string,
    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,
  ) {}
}

export class CreateDepartmentCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly requestedBy: string,
    public readonly parentId?: string,
  ) {}
}

export class CreateDesignationCommand implements ICommand {
  constructor(
    public readonly companyId: string,
    public readonly name: string,
    public readonly code: string,
    public readonly level: number,
    public readonly requestedBy: string,
  ) {}
}
