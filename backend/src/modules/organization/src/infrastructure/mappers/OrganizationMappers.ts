import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { CompanyAggregate } from '../../domain/entities/CompanyAggregate';
import { BranchEntity } from '../../domain/entities/BranchEntity';
import { DepartmentEntity } from '../../domain/entities/DepartmentEntity';
import { DesignationEntity } from '../../domain/entities/DesignationEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export class CompanyMapper implements Mapper<CompanyAggregate, any, any> {
  toDomain(raw: any): CompanyAggregate {
    return CompanyAggregate.create(
      {
        businessId: raw.businessId,
        name: raw.name,
        legalName: raw.legalName,
        code: raw.code,
        website: raw.website,
        address: raw.address,
        phone: raw.phone,
        email: raw.email,
        logoUrl: raw.logoUrl,
        authorizedPerson: raw.authorizedPerson,
        authorizedPersonDesignation: raw.authorizedPersonDesignation,
        signatureUrl: raw.signatureUrl,
        industry: raw.industry,
        registrationNumber: raw.registrationNumber,
        taxNumber: raw.taxNumber,
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
  toDTO(entity: CompanyAggregate): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      name: entity.name,
      legalName: entity.legalName,
      code: entity.code,
      website: entity.website,
      address: entity.address,
      phone: entity.phone,
      email: entity.email,
      logoUrl: entity.logoUrl,
      authorizedPerson: entity.authorizedPerson,
      authorizedPersonDesignation: entity.authorizedPersonDesignation,
      signatureUrl: entity.signatureUrl,
      industry: entity.industry,
      isActive: entity.isActive,
      updatedAt: entity.updatedAt,
    };
  }
  toPersistence(entity: CompanyAggregate): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      name: entity.name,
      legalName: entity.legalName,
      code: entity.code,
      website: entity.website,
      address: entity.address,
      phone: entity.phone,
      email: entity.email,
      logoUrl: entity.logoUrl,
      authorizedPerson: entity.authorizedPerson,
      authorizedPersonDesignation: entity.authorizedPersonDesignation,
      signatureUrl: entity.signatureUrl,
      industry: entity.industry,
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

export class BranchMapper implements Mapper<BranchEntity, any, any> {
  toDomain(raw: any): BranchEntity {
    return BranchEntity.create(
      {
        businessId: raw.businessId,
        companyId: raw.companyId,
        name: raw.name,
        code: raw.code,
        isHeadquarters: raw.isHeadquarters,
        addressLine1: raw.addressLine1,
        city: raw.city,
        state: raw.state,
        country: raw.country,
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
  toDTO(entity: BranchEntity): any {
    throw new Error('Not implemented');
  }
  toPersistence(entity: BranchEntity): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId,
      name: entity.name,
      code: entity.code,
      isHeadquarters: entity.isHeadquarters,
      addressLine1: entity.props.addressLine1,
      city: entity.props.city,
      state: entity.props.state,
      country: entity.props.country,
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

export class DepartmentMapper implements Mapper<DepartmentEntity, any, any> {
  toDomain(raw: any): DepartmentEntity {
    return DepartmentEntity.create(
      {
        businessId: raw.businessId,
        companyId: raw.companyId,
        name: raw.name,
        code: raw.code,
        parentId: raw.parentId,
        managerId: raw.managerId,
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
  toDTO(entity: DepartmentEntity): any {
    throw new Error('Not implemented');
  }
  toPersistence(entity: DepartmentEntity): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId,
      name: entity.name,
      code: entity.code,
      parentId: entity.parentId,
      managerId: entity.props.managerId,
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

export class DesignationMapper implements Mapper<DesignationEntity, any, any> {
  toDomain(raw: any): DesignationEntity {
    return DesignationEntity.create(
      {
        businessId: raw.businessId,
        companyId: raw.companyId,
        name: raw.name,
        code: raw.code,
        level: raw.level,
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
  toDTO(entity: DesignationEntity): any {
    throw new Error('Not implemented');
  }
  toPersistence(entity: DesignationEntity): any {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId,
      name: entity.name,
      code: entity.code,
      level: entity.level,
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
