import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../../../../../infrastructure/database/repositories/PrismaRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../../../../infrastructure/database/transaction/PrismaUnitOfWork';
import { FieldDefinitionAggregate } from '../../domain/entities/FieldDefinitionAggregate';
import { IFieldDefinitionRepository } from '../../domain/repositories/IFieldDefinitionRepository';
import { FieldDefinitionMapper } from '../mappers/FieldDefinitionMapper';

@Injectable()
export class PrismaFieldDefinitionRepository
  extends PrismaRepository<FieldDefinitionAggregate, any>
  implements IFieldDefinitionRepository
{
  constructor(uow: PrismaUnitOfWork, prisma: PrismaService) {
    super(uow, prisma, new FieldDefinitionMapper());
  }

  protected get delegate(): any {
    return this.client.fieldDefinition;
  }

  async findById(id: string): Promise<FieldDefinitionAggregate | null> {
    const record = await this.delegate.findUnique({
      where: { id },
      include: {
        options: true,
        validations: true,
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findByMachineKey(
    companyId: string,
    machineKey: string,
  ): Promise<FieldDefinitionAggregate | null> {
    const record = await this.delegate.findFirst({
      where: {
        machineKey,
        OR: [
          { companyId },
          { companyId: null }, // System fields might not have a companyId
        ],
      },
      include: {
        options: true,
        validations: true,
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findByBusinessId(
    businessId: string,
  ): Promise<FieldDefinitionAggregate | null> {
    const record = await this.delegate.findUnique({
      where: { businessId },
      include: {
        options: true,
        validations: true,
      },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async save(entity: FieldDefinitionAggregate): Promise<void> {
    const persistenceData = this.mapper.toPersistence(entity);

    await this.client.$transaction(async (tx: any) => {
      // Upsert the main aggregate
      const existing = await tx.fieldDefinition.findUnique({
        where: { id: entity.id.toString() },
      });
      if (existing) {
        await tx.fieldDefinition.update({
          where: { id: entity.id.toString() },
          data: persistenceData,
        });

        // Clean and re-insert children for simplicity in DDD save
        await tx.fieldOption.deleteMany({
          where: { fieldDefinitionId: entity.id.toString() },
        });
        await tx.fieldValidation.deleteMany({
          where: { fieldDefinitionId: entity.id.toString() },
        });
      } else {
        await tx.fieldDefinition.create({ data: persistenceData });
      }

      // Insert options
      if (entity.options && entity.options.length > 0) {
        await tx.fieldOption.createMany({
          data: entity.options.map((o) => ({
            id: o.id.toString(),
            fieldDefinitionId: entity.id.toString(),
            label: o.label,
            value: o.value,
            displayOrder: o.displayOrder,
            isActive: o.isActive,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
            createdBy: o.createdBy,
            updatedBy: o.updatedBy,
          })),
        });
      }

      // Insert validations
      if (entity.validations && entity.validations.length > 0) {
        await tx.fieldValidation.createMany({
          data: entity.validations.map((v) => ({
            id: v.id.toString(),
            fieldDefinitionId: entity.id.toString(),
            ruleType: v.ruleType,
            ruleValue: v.ruleValue,
            errorMessage: v.errorMessage,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
            createdBy: v.createdBy,
            updatedBy: v.updatedBy,
          })),
        });
      }
    });
  }
}
