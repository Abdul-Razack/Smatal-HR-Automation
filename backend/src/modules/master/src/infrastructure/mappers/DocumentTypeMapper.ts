import { DocumentTypeEntity } from '../../domain/entities/DocumentTypeEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

import { Mapper } from '@smatal/kernel/mapping/mapping.contracts';

export class DocumentTypeMapper implements Mapper<
  DocumentTypeEntity,
  any,
  any
> {
  public toDomain(row: any): any {
    return DocumentTypeEntity.create(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId as string),
        name: row.name,
        code: row.code,
        description: row.description,
        isActive: row.isActive,
        isDeleted: row.isDeleted,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
      },
      new Identifier<string>(row.id),
    );
  }

  toDTO(entity: any): any {
    throw new Error('Not implemented');
  }

  public toPersistence(domain: any): any {
    return {
      id: domain.id.toString(),
      businessId: domain.businessId,
      companyId: domain.companyId,
      name: domain.name,
      code: domain.code,
      description: domain.description,
      isActive: domain.isActive,
      isDeleted: domain.isDeleted,
      version: domain.version,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      createdBy: domain.createdBy,
      updatedBy: domain.updatedBy,
    };
  }
}
