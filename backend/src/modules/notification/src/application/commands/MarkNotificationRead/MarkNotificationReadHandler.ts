import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkNotificationReadCommand } from './MarkNotificationReadCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(MarkNotificationReadCommand)
@Injectable()
export class MarkNotificationReadHandler implements ICommandHandler<MarkNotificationReadCommand> {
  constructor(
    @Inject('INotificationRepository')
    private readonly repository: INotificationRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: MarkNotificationReadCommand): Promise<Result<void>> {
    try {
      const notification = await this.repository.findById(
        command.companyId,
        command.notificationId,
      );
      if (!notification) {
        return Result.fail('Notification not found');
      }

      if (notification.recipient !== command.userId) {
        return Result.fail('Unauthorized access to this notification');
      }

      notification.markAsRead();

      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(notification);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
