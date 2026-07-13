import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { DocumentTypeAggregate } from '../../domain/aggregates/DocumentTypeAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export class DocumentTypeMapper implements Mapper<
  DocumentTypeAggregate,
  any,
  any
> {
  toDomain(row: any): DocumentTypeAggregate {
    return DocumentTypeAggregate.create(
      {
        businessId: row.businessId,
        companyId: row.companyId,
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

  toPersistence(domain: DocumentTypeAggregate): any {
    return {
      id: domain.id.toValue() as string,
      businessId: domain.businessId,
      companyId: domain.companyId,
      name: domain.name,
      code: domain.code,
      description: domain.description ?? null,
      isActive: domain.isActive,
      isDeleted: domain.isDeleted,
      deletedAt: null,
      deletedBy: null,
      version: domain.version,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      createdBy: domain.createdBy,
      updatedBy: domain.updatedBy,
    };
  }

  toDTO(domain: DocumentTypeAggregate): any {
    return {
      id: domain.id.toValue(),
      businessId: domain.businessId,
      companyId: domain.companyId,
      name: domain.name,
      code: domain.code,
      description: domain.description,
      isActive: domain.isActive,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
