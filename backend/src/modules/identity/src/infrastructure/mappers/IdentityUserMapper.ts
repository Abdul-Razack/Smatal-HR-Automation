import { Mapper } from '@smatal/kernel/mapping/mapping.contracts';
import {
  IdentityUserAggregate,
  IdentityUserProps,
} from '../../domain/entities/IdentityUserAggregate';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export class IdentityUserMapper implements Mapper<
  IdentityUserAggregate,
  any,
  any
> {
  toDomain(raw: any): IdentityUserAggregate {
    return IdentityUserAggregate.create(
      {
        businessId: raw.businessId,
        profileId: raw.profileId,
        companyId: new Identifier(raw.companyId),
        email: raw.email,
        passwordHash: raw.passwordHash,
        isActive: raw.isActive,
        isEmailVerified: raw.isEmailVerified,
        emailVerifiedAt: raw.emailVerifiedAt,
        mfaEnabled: raw.mfaEnabled,
        mfaSecret: raw.mfaSecret,
        lastLoginAt: raw.lastLoginAt,
        loginAttempts: raw.loginAttempts,
        lockedUntil: raw.lockedUntil,
        passwordChangedAt: raw.passwordChangedAt,
        isDeleted: raw.isDeleted,
        deletedAt: raw.deletedAt,
        deletedBy: raw.deletedBy,
        version: raw.version,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy,
        updatedBy: raw.updatedBy,
        firstName: raw.profile?.firstName,
        lastName: raw.profile?.lastName,
        avatar: raw.profile?.avatar,
      },
      new Identifier(raw.id),
    );
  }

  toDTO(entity: IdentityUserAggregate): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      email: entity.email,
      profileId: entity.profileId,
      companyId: entity.companyId,
      isActive: entity.isActive,
      isEmailVerified: entity.isEmailVerified,
      lastLoginAt: entity.lastLoginAt,
      createdAt: entity.createdAt,
      firstName: entity.firstName,
      lastName: entity.lastName,
      avatar: entity.avatar,
    };
  }

  toPersistence(entity: IdentityUserAggregate): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      profileId: entity.profileId,
      companyId: entity.companyId,
      email: entity.email,
      passwordHash: entity.passwordHash,
      isActive: entity.isActive,
      isEmailVerified: entity.isEmailVerified,
      mfaEnabled: entity.mfaEnabled,
      loginAttempts: entity.loginAttempts,
      lastLoginAt: entity.lastLoginAt,
      lockedUntil: entity.lockedUntil,
      isDeleted: entity.isDeleted,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
