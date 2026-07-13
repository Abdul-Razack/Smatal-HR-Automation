import {
  FieldDefinitionAggregate,
  FieldDataType,
  FieldEntityType,
} from '../../domain/entities/FieldDefinitionAggregate';
import { FieldOptionEntity } from '../../domain/entities/FieldOptionEntity';
import {
  FieldValidationEntity,
  ValidationRuleType,
} from '../../domain/entities/FieldValidationEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

import { Mapper } from '@smatal/kernel/mapping/mapping.contracts';

export class FieldDefinitionMapper implements Mapper<
  FieldDefinitionAggregate,
  any,
  any
> {
  public toDomain(row: any): FieldDefinitionAggregate {
    const options =
      row.options?.map((opt: any) =>
        FieldOptionEntity.create(
          {
            fieldDefinitionId: opt.fieldDefinitionId,
            label: opt.label,
            value: opt.value,
            displayOrder: opt.displayOrder,
            isActive: opt.isActive,
            createdAt: opt.createdAt,
            updatedAt: opt.updatedAt,
            createdBy: opt.createdBy,
            updatedBy: opt.updatedBy,
          },
          new Identifier<string>(opt.id),
        ),
      ) || [];

    const validations =
      row.validations?.map((val: any) =>
        FieldValidationEntity.create(
          {
            fieldDefinitionId: val.fieldDefinitionId,
            ruleType: val.ruleType as ValidationRuleType,
            ruleValue: val.ruleValue,
            errorMessage: val.errorMessage,
            createdAt: val.createdAt,
            updatedAt: val.updatedAt,
            createdBy: val.createdBy,
            updatedBy: val.updatedBy,
          },
          new Identifier<string>(val.id),
        ),
      ) || [];

    return FieldDefinitionAggregate.create(
      {
        businessId: row.businessId,
        companyId: row.companyId
          ? new Identifier<string>(row.companyId)
          : undefined,
        machineKey: row.machineKey,
        displayName: row.displayName,
        description: row.description,
        dataType: row.dataType as FieldDataType,
        entityType: row.entityType as FieldEntityType,
        isSystem: row.isSystem,
        isRequired: row.isRequired,
        defaultValue: row.defaultValue,
        displayOrder: row.displayOrder,
        groupId: row.groupId,
        isActive: row.isActive,
        isDeleted: row.isDeleted,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        options,
        validations,
      },
      new Identifier<string>(row.id),
    );
  }

  toDTO(entity: FieldDefinitionAggregate): any {
    throw new Error('Not implemented');
  }

  public toPersistence(domain: FieldDefinitionAggregate): any {
    return {
      id: domain.id.toString(),
      businessId: domain.businessId,
      companyId: domain.companyId,
      machineKey: domain.machineKey,
      displayName: domain.displayName,
      description: domain.description,
      dataType: domain.dataType,
      entityType: domain.entityType,
      isSystem: domain.isSystem,
      isRequired: domain.isRequired,
      defaultValue: domain.defaultValue,
      displayOrder: domain.displayOrder,
      groupId: domain.groupId,
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
