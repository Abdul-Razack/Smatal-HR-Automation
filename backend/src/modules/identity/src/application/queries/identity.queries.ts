import { IQuery } from '@smatal/kernel/cqrs/cqrs.contracts';
import {
  IPaginationOptions,
  ISortOptions,
} from '@smatal/kernel/repositories/repository.contracts';

export class GetUserByIdQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly companyId: string,
  ) {}
}

export class GetUserByEmailQuery implements IQuery {
  constructor(
    public readonly email: string,
    public readonly companyId: string,
  ) {}
}

export class ListUsersQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly pagination?: IPaginationOptions,
    public readonly sort?: ISortOptions,
  ) {}
}

export class GetRoleByIdQuery implements IQuery {
  constructor(
    public readonly roleId: string,
    public readonly companyId: string,
  ) {}
}

export class ListRolesQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}

export class GetProfileByIdQuery implements IQuery {
  constructor(public readonly profileId: string) {}
}

export class GetUserPermissionsQuery implements IQuery {
  constructor(
    public readonly userId: string,
    public readonly companyId: string,
  ) {}
}
