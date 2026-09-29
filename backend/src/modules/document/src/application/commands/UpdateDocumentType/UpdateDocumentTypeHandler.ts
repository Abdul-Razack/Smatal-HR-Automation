import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDocumentTypeCommand } from './UpdateDocumentTypeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IDocumentTypeRepository } from '../../../domain/repositories/IDocumentTypeRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(UpdateDocumentTypeCommand)
@Injectable()
export class UpdateDocumentTypeHandler
  implements ICommandHandler<UpdateDocumentTypeCommand>
{
  constructor(
    @Inject('IDocumentTypeRepository')
    private readonly repository: IDocumentTypeRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: UpdateDocumentTypeCommand): Promise<Result<void>> {
    try {
      if (!command.name || !command.name.trim()) {
        return Result.fail<void>('Document type name is required.');
      }

      const aggregate = await this.repository.findById(command.id);
      if (!aggregate || aggregate.isDeleted || aggregate.companyId !== command.companyId) {
        return Result.fail<void>('Document type not found');
      }

      aggregate.updateDetails(
        command.name.trim(),
        command.description?.trim() || null,
        command.performedBy,
      );

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(aggregate);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
