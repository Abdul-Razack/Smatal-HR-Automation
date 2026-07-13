import { BaseCommandHandler } from '../../../../../../kernel/application/handlers/BaseCommandHandler';
import { CreateFieldGroupCommand } from './CreateFieldGroupCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { Inject, Injectable } from '@nestjs/common';
import { IFieldGroupRepository } from '../../../domain/repositories/IFieldGroupRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { FieldGroupEntity } from '../../../domain/entities/FieldGroupEntity';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { DomainException } from '../../../../../../kernel/domain/DomainException';
import { ErrorCode } from '@smatal/shared';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';

@Injectable()
export class CreateFieldGroupHandler extends BaseCommandHandler<
  CreateFieldGroupCommand,
  string
> {
  constructor(
    @Inject('IFieldGroupRepository')
    private readonly fieldGroupRepository: IFieldGroupRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly businessIdGenerator: IBusinessIdGenerator,
  ) {
    super();
  }

  async handle(command: CreateFieldGroupCommand): Promise<Result<string>> {
    try {
      const existing = await this.fieldGroupRepository.findByName(
        command.companyId,
        command.name,
      );
      if (existing && !existing.isDeleted) {
        throw new DomainException(
          `Field group with name ${command.name} already exists`,
          ErrorCode.CONFLICT,
        );
      }

      const businessId = await this.businessIdGenerator.generate('FGP');

      const entity = FieldGroupEntity.create(
        {
          businessId,
          companyId: new Identifier<string>(command.companyId),
          name: command.name,
          description: command.description,
          displayOrder: command.displayOrder || 0,
          version: 1,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        new Identifier<string>(crypto.randomUUID()),
      );

      await this.unitOfWork.withTransaction(async () => {
        await this.fieldGroupRepository.save(entity);
      });

      return Result.ok(entity.id.toString());
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
