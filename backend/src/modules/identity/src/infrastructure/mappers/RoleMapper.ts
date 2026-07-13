import { Mapper } from '@smatal/kernel/mapping/mapping.contracts';
import { RoleEntity } from '../../domain/entities/RoleEntity';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export class RoleMapper implements Mapper<RoleEntity, any, any> {
  toDomain(raw: any): RoleEntity {
    return RoleEntity.create(
      {
        businessId: raw.businessId,
        companyId: raw.companyId,
        name: raw.name,
        code: raw.code,
        description: raw.description,
        isSystem: raw.isSystem,
        isActive: raw.isActive,
        isDeleted: raw.isDeleted,
        version: raw.version,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy,
        updatedBy: raw.updatedBy,
      },
      new Identifier(raw.id),
    );
  }

  toDTO(entity: RoleEntity): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      name: entity.name,
      code: entity.code,
      companyId: entity.companyId,
    };
  }

  toPersistence(entity: RoleEntity): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId,
      name: entity.name,
      code: entity.code,
      description: entity.props.description,
      isSystem: entity.isSystem,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
