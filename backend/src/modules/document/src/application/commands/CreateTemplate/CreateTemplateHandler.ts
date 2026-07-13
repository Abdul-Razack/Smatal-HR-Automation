import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTemplateCommand } from './CreateTemplateCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { TemplateAggregate } from '../../../domain/aggregates/TemplateAggregate';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { TemplateStatus } from '../../../domain/enums/DocumentEnums';

@CommandHandler(CreateTemplateCommand)
@Injectable()
export class CreateTemplateHandler implements ICommandHandler<CreateTemplateCommand> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly repository: ITemplateRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
  ) {}

  async execute(command: CreateTemplateCommand): Promise<Result<string>> {
    try {
      const businessId = await this.idGenerator.generate('TPL');

      const template = TemplateAggregate.create({
        businessId,
        companyId: command.companyId,
        documentTypeId: command.documentTypeId,
        name: command.name,
        description: command.description,
        status: TemplateStatus.DRAFT,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: command.performedBy,
        updatedBy: command.performedBy,
        versions: [],
      });

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(template);
      });

      return Result.ok<string>(template.id.toValue() as string);
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
