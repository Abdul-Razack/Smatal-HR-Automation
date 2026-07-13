import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module';

// Mappers
import { NotificationMapper } from './src/infrastructure/mappers/NotificationMapper';

// Repositories
import { PrismaNotificationRepository } from './src/infrastructure/repositories/PrismaNotificationRepository';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';
import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';

// Command Handlers
import { CreateNotificationHandler } from './src/application/commands/CreateNotification/CreateNotificationHandler';
import { MarkNotificationReadHandler } from './src/application/commands/MarkNotificationRead/MarkNotificationReadHandler';

// Query Handlers
import { GetNotificationsHandler } from './src/application/queries/GetNotifications/GetNotificationsHandler';

// Controllers
import { NotificationController } from './src/presentation/controllers/NotificationController';

const CommandHandlers = [
  CreateNotificationHandler,
  MarkNotificationReadHandler,
];

const QueryHandlers = [GetNotificationsHandler];

const Repositories = [
  {
    provide: 'INotificationRepository',
    useClass: PrismaNotificationRepository,
  },
  { provide: 'IUnitOfWork', useClass: PrismaUnitOfWork },
  { provide: 'IBusinessIdGenerator', useClass: BusinessIdGenerator },
];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [NotificationController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    NotificationMapper,
    PrismaUnitOfWork,
    BusinessIdGenerator,
  ],
  exports: ['INotificationRepository'],
})
export class NotificationModule {}
