import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { NotificationAggregate } from '../../domain/aggregates/NotificationAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { NotificationType } from '../../domain/enums/NotificationType';

export class NotificationMapper implements Mapper<
  NotificationAggregate,
  any,
  any
> {
  toDomain(row: any): NotificationAggregate {
    return NotificationAggregate.create(
      {
        businessId: row.businessId,
        companyId: row.companyId,
        title: row.title,
        message: row.message,
        notificationType: row.notificationType as NotificationType,
        priority: row.priority,
        recipient: row.recipient,
        readStatus: row.readStatus,
        createdAt: row.createdAt,
      },
      new Identifier<string>(row.id),
    );
  }

  toPersistence(domain: NotificationAggregate): any {
    return {
      id: domain.id.toValue() as string,
      businessId: domain.businessId,
      companyId: domain.companyId,
      title: domain.title,
      message: domain.message,
      notificationType: domain.notificationType,
      priority: domain.priority,
      recipient: domain.recipient,
      readStatus: domain.readStatus,
      createdAt: domain.createdAt,
    };
  }

  toDTO(domain: NotificationAggregate): any {
    return {
      id: domain.id.toValue(),
      businessId: domain.businessId,
      companyId: domain.companyId,
      title: domain.title,
      message: domain.message,
      notificationType: domain.notificationType,
      priority: domain.priority,
      recipient: domain.recipient,
      readStatus: domain.readStatus,
      createdAt: domain.createdAt,
    };
  }
}
