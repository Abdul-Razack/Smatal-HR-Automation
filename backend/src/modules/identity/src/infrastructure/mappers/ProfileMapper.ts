import { Mapper } from '@smatal/kernel/mapping/mapping.contracts';
import { ProfileAggregate } from '../../domain/entities/ProfileAggregate';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export class ProfileMapper implements Mapper<ProfileAggregate, any, any> {
  toDomain(raw: any): ProfileAggregate {
    return ProfileAggregate.create(
      {
        businessId: raw.businessId ?? '',
        firstName: raw.firstName,
        lastName: raw.lastName,
        personalEmail: raw.personalEmail,
        phone: raw.phone,
        dateOfBirth: raw.dateOfBirth,
        gender: raw.gender,
        nationality: raw.nationality,
        profilePhoto: raw.profilePhoto,
        isDeleted: raw.isDeleted,
        deletedAt: raw.deletedAt,
        deletedBy: raw.deletedBy,
        version: raw.version,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy,
        updatedBy: raw.updatedBy,
      },
      new Identifier(raw.id),
    );
  }

  toDTO(entity: ProfileAggregate): any {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      personalEmail: entity.personalEmail,
    };
  }

  toPersistence(entity: ProfileAggregate): any {
    return {
      id: entity.id.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      personalEmail: entity.personalEmail,
      phone: entity.phone,
      dateOfBirth: entity.dateOfBirth,
      isDeleted: entity.isDeleted,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
