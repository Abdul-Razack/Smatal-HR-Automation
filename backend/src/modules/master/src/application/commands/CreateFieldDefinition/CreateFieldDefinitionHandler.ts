import { BaseCommandHandler } from '../../../../../../kernel/application/handlers/BaseCommandHandler';
import { CreateFieldDefinitionCommand } from './CreateFieldDefinitionCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { Inject, Injectable } from '@nestjs/common';
import { IFieldDefinitionRepository } from '../../../domain/repositories/IFieldDefinitionRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { FieldDefinitionAggregate } from '../../../domain/entities/FieldDefinitionAggregate';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { DomainException } from '../../../../../../kernel/domain/DomainException';
import { ErrorCode } from '@smatal/shared';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { FieldOptionEntity } from '../../../domain/entities/FieldOptionEntity';
import { FieldValidationEntity } from '../../../domain/entities/FieldValidationEntity';

@Injectable()
export class CreateFieldDefinitionHandler extends BaseCommandHandler<
  CreateFieldDefinitionCommand,
  string
> {
  constructor(
    @Inject('IFieldDefinitionRepository')
    private readonly fieldDefinitionRepository: IFieldDefinitionRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly businessIdGenerator: IBusinessIdGenerator,
  ) {
    super();
  }

  async handle(command: CreateFieldDefinitionCommand): Promise<Result<string>> {
    try {
      const existing = await this.fieldDefinitionRepository.findByMachineKey(
        command.companyId,
        command.machineKey,
      );
      if (existing && !existing.isDeleted) {
        throw new DomainException(
          `Field definition with machine key ${command.machineKey} already exists`,
          ErrorCode.CONFLICT,
        );
      }

      const businessId = await this.businessIdGenerator.generate('FLD');
      const aggregateId = new Identifier<string>(crypto.randomUUID());

      const options = command.options?.map((opt) =>
        FieldOptionEntity.create(
          {
            fieldDefinitionId: aggregateId.toString(),
            label: opt.label,
            value: opt.value,
            displayOrder: opt.displayOrder || 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: command.performedBy,
            updatedBy: command.performedBy,
          },
          new Identifier<string>(crypto.randomUUID()),
        ),
      );

      const validations = command.validations?.map((val) =>
        FieldValidationEntity.create(
          {
            fieldDefinitionId: aggregateId.toString(),
            ruleType: val.ruleType as any,
            ruleValue: val.ruleValue,
            errorMessage: val.errorMessage,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: command.performedBy,
            updatedBy: command.performedBy,
          },
          new Identifier<string>(crypto.randomUUID()),
        ),
      );

      const aggregate = FieldDefinitionAggregate.create(
        {
          businessId,
          companyId: new Identifier<string>(command.companyId),
          machineKey: command.machineKey,
          displayName: command.displayName,
          description: command.description,
          dataType: command.dataType,
          entityType: command.entityType,
          isSystem: false,
          isRequired: command.isRequired,
          defaultValue: command.defaultValue,
          displayOrder: command.displayOrder || 0,
          groupId: command.groupId,
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
          options,
          validations,
        },
        aggregateId,
      );

      await this.unitOfWork.withTransaction(async () => {
        await this.fieldDefinitionRepository.save(aggregate);
      });

      return Result.ok(aggregate.id.toString());
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
