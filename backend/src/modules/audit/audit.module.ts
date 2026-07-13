import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module';

// Mappers
import { AuditMapper } from './src/infrastructure/mappers/AuditMapper';

// Repositories
import { PrismaAuditRepository } from './src/infrastructure/repositories/PrismaAuditRepository';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';
import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';

// Command Handlers
import { CreateAuditLogHandler } from './src/application/commands/CreateAuditLog/CreateAuditLogHandler';

// Query Handlers
import { GetAuditHistoryHandler } from './src/application/queries/GetAuditHistory/GetAuditHistoryHandler';

// Controllers
import { AuditController } from './src/presentation/controllers/AuditController';

const CommandHandlers = [CreateAuditLogHandler];

const QueryHandlers = [GetAuditHistoryHandler];

const Repositories = [
  { provide: 'IAuditRepository', useClass: PrismaAuditRepository },
  { provide: 'IUnitOfWork', useClass: PrismaUnitOfWork },
  { provide: 'IBusinessIdGenerator', useClass: BusinessIdGenerator },
];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [AuditController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    AuditMapper,
    PrismaUnitOfWork,
    BusinessIdGenerator,
  ],
  exports: ['IAuditRepository'],
})
export class AuditModule {}
