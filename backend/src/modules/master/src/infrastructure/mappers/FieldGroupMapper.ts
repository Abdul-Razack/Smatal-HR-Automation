import { FieldGroupEntity } from '../../domain/entities/FieldGroupEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

import { Mapper } from '@smatal/kernel/mapping/mapping.contracts';

export class FieldGroupMapper implements Mapper<any, any, any> {
  public toDomain(row: any): any {
    return FieldGroupEntity.create(
      {
        businessId: 'N/A',
        version: 1,
        companyId: new Identifier<string>(row.companyId as string),
        name: row.name,
        description: row.description,
        displayOrder: row.displayOrder,
        isDeleted: row.isDeleted,
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
      companyId: domain.companyId,
      name: domain.name,
      description: domain.description,
      displayOrder: domain.displayOrder,
      isDeleted: domain.isDeleted,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      createdBy: domain.createdBy,
      updatedBy: domain.updatedBy,
    };
  }
}
