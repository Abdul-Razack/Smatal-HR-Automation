import { NotificationAggregate } from '../aggregates/NotificationAggregate';

export interface INotificationRepository {
  save(notification: NotificationAggregate): Promise<void>;
  findById(
    companyId: string,
    notificationId: string,
  ): Promise<NotificationAggregate | null>;
  findByRecipient(
    companyId: string,
    recipient: string,
    unreadOnly?: boolean,
    limit?: number,
    offset?: number,
  ): Promise<NotificationAggregate[]>;
}
