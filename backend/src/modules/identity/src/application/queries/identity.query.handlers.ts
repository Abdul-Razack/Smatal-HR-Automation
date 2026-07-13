import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetUserByIdQuery,
  GetUserByEmailQuery,
  ListUsersQuery,
  GetRoleByIdQuery,
  ListRolesQuery,
  GetProfileByIdQuery,
  GetUserPermissionsQuery,
} from '../queries/identity.queries';
import {
  IIdentityUserRepository,
  IDENTITY_USER_REPOSITORY,
} from '../../domain/repositories/IIdentityUserRepository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY,
} from '../../domain/repositories/IProfileRepository';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../domain/repositories/IRoleRepository';
import {
  UserResponseDto,
  ProfileResponseDto,
  RoleResponseDto,
} from '../dtos/identity.dto';
import { IPaginatedResult } from '@smatal/kernel/repositories/repository.contracts';

@Injectable()
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(query.userId);
    if (!user || user.companyId !== query.companyId) {
      throw new NotFoundException('User not found.');
    }
    return {
      id: user.id.toString(),
      businessId: user.businessId,
      email: user.email,
      profileId: user.profileId,
      companyId: user.companyId,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    };
  }
}

@Injectable()
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
  ) {}

  async execute(query: GetUserByEmailQuery): Promise<UserResponseDto | null> {
    const user = await this.userRepo.findByEmail(query.email, query.companyId);
    if (!user) return null;
    return {
      id: user.id.toString(),
      businessId: user.businessId,
      email: user.email,
      profileId: user.profileId,
      companyId: user.companyId,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    };
  }
}

@Injectable()
@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
  ) {}

  async execute(
    query: ListUsersQuery,
  ): Promise<IPaginatedResult<UserResponseDto>> {
    const result = await this.userRepo.findOnePaginated(
      { companyId: query.companyId },
      query.pagination,
      query.sort,
    );
    return {
      ...result,
      data: result.data.map((u) => ({
        id: u.id.toString(),
        businessId: u.businessId,
        email: u.email,
        profileId: u.profileId,
        companyId: u.companyId,
        isActive: u.isActive,
        isEmailVerified: u.isEmailVerified,
        mfaEnabled: u.mfaEnabled,
        lastLoginAt: u.lastLoginAt ?? null,
        createdAt: u.createdAt,
        firstName: u.firstName,
        lastName: u.lastName,
        avatar: u.avatar,
      })),
    };
  }
}

@Injectable()
@QueryHandler(GetRoleByIdQuery)
export class GetRoleByIdHandler implements IQueryHandler<GetRoleByIdQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepo: IRoleRepository,
  ) {}

  async execute(query: GetRoleByIdQuery): Promise<RoleResponseDto> {
    const role = await this.roleRepo.findById(query.roleId);
    if (!role || role.companyId !== query.companyId) {
      throw new NotFoundException('Role not found.');
    }
    return {
      id: role.id.toString(),
      businessId: role.businessId,
      name: role.name,
      code: role.code,
      companyId: role.companyId,
      isSystem: role.isSystem,
      isActive: role.isActive,
    };
  }
}

@Injectable()
@QueryHandler(ListRolesQuery)
export class ListRolesHandler implements IQueryHandler<ListRolesQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepo: IRoleRepository,
  ) {}

  async execute(query: ListRolesQuery): Promise<RoleResponseDto[]> {
    const roles = await this.roleRepo.findAllByCompany(query.companyId);
    return roles.map((r) => ({
      id: r.id.toString(),
      businessId: r.businessId,
      name: r.name,
      code: r.code,
      companyId: r.companyId,
      isSystem: r.isSystem,
      isActive: r.isActive,
    }));
  }
}

@Injectable()
@QueryHandler(GetProfileByIdQuery)
export class GetProfileByIdHandler implements IQueryHandler<GetProfileByIdQuery> {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: IProfileRepository,
  ) {}

  async execute(query: GetProfileByIdQuery): Promise<ProfileResponseDto> {
    const profile = await this.profileRepo.findById(query.profileId);
    if (!profile) throw new NotFoundException('Profile not found.');
    return {
      id: profile.id.toString(),
      firstName: profile.firstName,
      lastName: profile.lastName,
      personalEmail: profile.personalEmail,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth,
      createdAt: profile.createdAt,
    };
  }
}
