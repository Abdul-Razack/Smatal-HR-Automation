import { IQuery } from '@smatal/kernel/cqrs/cqrs.contracts';

export class GetCompanyByIdQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}

export class ListBranchesQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}

export class ListDepartmentsQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}

export class ListDesignationsQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}
