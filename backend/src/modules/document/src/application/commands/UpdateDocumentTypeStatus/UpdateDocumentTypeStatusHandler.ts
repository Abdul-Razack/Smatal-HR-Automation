import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDocumentTypeStatusCommand } from './UpdateDocumentTypeStatusCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(UpdateDocumentTypeStatusCommand)
@Injectable()
export class UpdateDocumentTypeStatusHandler
  implements ICommandHandler<UpdateDocumentTypeStatusCommand>
{
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly repository: IDocumentTypeRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: UpdateDocumentTypeStatusCommand): Promise<Result<void>> {
    try {
      const aggregate = await this.repository.findById(command.id);
      if (!aggregate || aggregate.isDeleted || aggregate.companyId !== command.companyId) {
        return Result.fail<void>('Document type not found');
      }

      if (command.isActive) {
        aggregate.activate(command.performedBy);
      } else {
        aggregate.deactivate(command.performedBy);
      }

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(aggregate);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
