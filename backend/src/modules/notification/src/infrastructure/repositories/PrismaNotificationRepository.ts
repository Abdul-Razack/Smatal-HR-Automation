import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { NotificationAggregate } from '../../domain/aggregates/NotificationAggregate';
import { NotificationMapper } from '../mappers/NotificationMapper';

@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: NotificationMapper,
  ) {}

  async save(notification: NotificationAggregate): Promise<void> {
    const data = this.mapper.toPersistence(notification);

    await this.prisma.notification.upsert({
      where: { id: data.id },
      update: {
        readStatus: data.readStatus,
      },
      create: data,
    });
  }

  async findById(
    companyId: string,
    notificationId: string,
  ): Promise<NotificationAggregate | null> {
    const record = await this.prisma.notification.findFirst({
      where: { id: notificationId, companyId },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async findByRecipient(
    companyId: string,
    recipient: string,
    unreadOnly: boolean = false,
    limit: number = 50,
    offset: number = 0,
  ): Promise<NotificationAggregate[]> {
    const whereClause: any = { companyId, recipient };
    if (unreadOnly) {
      whereClause.readStatus = false;
    }

    const records = await this.prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((record: any) => this.mapper.toDomain(record));
  }
}
