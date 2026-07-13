import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetNotificationsQuery } from './GetNotificationsQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { NotificationMapper } from '../../../infrastructure/mappers/NotificationMapper';

@QueryHandler(GetNotificationsQuery)
@Injectable()
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(
    @Inject('INotificationRepository')
    private readonly repository: INotificationRepository,
    private readonly mapper: NotificationMapper,
  ) {}

  async execute(query: GetNotificationsQuery): Promise<Result<any[]>> {
    try {
      const notifications = await this.repository.findByRecipient(
        query.companyId,
        query.recipient,
        query.unreadOnly,
        query.limit,
        query.offset,
      );

      const dtos = notifications.map((notif) => this.mapper.toDTO(notif));
      return Result.ok(dtos);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
