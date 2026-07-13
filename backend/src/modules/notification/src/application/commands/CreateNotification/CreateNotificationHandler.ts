import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNotificationCommand } from './CreateNotificationCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { NotificationAggregate } from '../../../domain/aggregates/NotificationAggregate';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(CreateNotificationCommand)
@Injectable()
export class CreateNotificationHandler implements ICommandHandler<CreateNotificationCommand> {
  constructor(
    @Inject('INotificationRepository')
    private readonly repository: INotificationRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
  ) {}

  async execute(command: CreateNotificationCommand): Promise<Result<string>> {
    try {
      const businessId = await this.idGenerator.generate('NTF');

      const notification = NotificationAggregate.create({
        businessId,
        companyId: command.companyId,
        title: command.title,
        message: command.message,
        notificationType: command.notificationType,
        priority: command.priority,
        recipient: command.recipient,
        readStatus: false,
        createdAt: new Date(),
      });

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(notification);
      });

      return Result.ok<string>(notification.id.toValue() as string);
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
