import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { DocumentModule } from '../document/document.module';

// Application — Commands
import { ApplyLeaveHandler } from './src/application/commands/ApplyLeave/ApplyLeaveHandler';
import { UpdateLeaveHandler } from './src/application/commands/UpdateLeave/UpdateLeaveHandler';
import { CancelLeaveHandler } from './src/application/commands/CancelLeave/CancelLeaveHandler';
import { DeleteLeaveHandler } from './src/application/commands/DeleteLeave/DeleteLeaveHandler';
import { ApproveLeaveHandler } from './src/application/commands/ApproveLeave/ApproveLeaveHandler';
import { RejectLeaveHandler } from './src/application/commands/RejectLeave/RejectLeaveHandler';
import { EscalateLeaveHandler } from './src/application/commands/EscalateLeave/EscalateLeaveHandler';

// Application — Queries
import { GetLeaveByIdHandler } from './src/application/queries/GetLeaveById/GetLeaveByIdHandler';
import { ListLeavesHandler } from './src/application/queries/ListLeaves/ListLeavesHandler';
import { GetLeaveBalanceHandler } from './src/application/queries/GetLeaveBalance/GetLeaveBalanceHandler';
import { ListLeaveTypesHandler } from './src/application/queries/ListLeaveTypes/ListLeaveTypesHandler';
import { ListHolidaysHandler } from './src/application/queries/ListHolidays/ListHolidaysHandler';
import { GetLeaveWorkflowHandler } from './src/application/queries/GetLeaveWorkflow/GetLeaveWorkflowHandler';
import { ListPendingLeaveApprovalsHandler } from './src/application/queries/ListPendingLeaveApprovals/ListPendingLeaveApprovalsHandler';
import { GetApprovalHistoryHandler } from './src/application/queries/GetApprovalHistory/GetApprovalHistoryHandler';
import { GetLeaveDashboardMetricsHandler } from './src/application/queries/GetLeaveDashboardMetrics/GetLeaveDashboardMetricsQuery';
import { GetLeaveChartsHandler } from './src/application/queries/GetLeaveCharts/GetLeaveChartsQuery';
import { GetLeaveReportsHandler } from './src/application/queries/GetLeaveReports/GetLeaveReportsQuery';
import { ExportLeaveReportHandler } from './src/application/queries/ExportLeaveReport/ExportLeaveReportQuery';

// Application - Event Handlers
import { LeaveWorkflowTriggerHandler } from './src/application/event-handlers/LeaveWorkflowTriggerHandler';
import { LeaveWorkflowCompletedHandler } from './src/application/event-handlers/LeaveWorkflowCompletedHandler';
import { LeaveWorkflowRejectedHandler } from './src/application/event-handlers/LeaveWorkflowRejectedHandler';
import { LeaveIntegrationEventHandler } from './src/application/event-handlers/LeaveIntegrationEventHandler';

// Domain Services
import { LeaveBusinessRules } from './src/domain/services/LeaveBusinessRules';
import { LeaveBalanceDomainService } from './src/domain/services/LeaveBalanceDomainService';

// Application Services
import { LeaveAccrualService } from './src/application/services/LeaveAccrualService';
import { LeaveCarryForwardService } from './src/application/services/LeaveCarryForwardService';
import { LeaveDurationCalculator } from './src/application/services/LeaveDurationCalculator';

// Infrastructure - Mappers
import { LeaveRequestMapper } from './src/infrastructure/mappers/LeaveRequestMapper';
import { LeaveTypeMapper } from './src/infrastructure/mappers/LeaveTypeMapper';
import { LeavePolicyMapper } from './src/infrastructure/mappers/LeavePolicyMapper';
import { LeaveBalanceMapper } from './src/infrastructure/mappers/LeaveBalanceMapper';
import { HolidayMapper } from './src/infrastructure/mappers/HolidayMapper';

// Infrastructure - Repositories
import { PrismaLeaveRequestRepository } from './src/infrastructure/repositories/PrismaLeaveRequestRepository';
import { PrismaLeaveTypeRepository } from './src/infrastructure/repositories/PrismaLeaveTypeRepository';
import { PrismaLeavePolicyRepository } from './src/infrastructure/repositories/PrismaLeavePolicyRepository';
import { PrismaLeaveBalanceRepository } from './src/infrastructure/repositories/PrismaLeaveBalanceRepository';
import { PrismaHolidayRepository } from './src/infrastructure/repositories/PrismaHolidayRepository';

// Presentation
import { LeaveController } from './src/presentation/controllers/LeaveController';
import { LeaveReportsController } from './src/presentation/controllers/LeaveReportsController';

// Shared / Database
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';

const COMMAND_HANDLERS = [
  ApplyLeaveHandler,
  UpdateLeaveHandler,
  CancelLeaveHandler,
  DeleteLeaveHandler,
  ApproveLeaveHandler,
  RejectLeaveHandler,
  EscalateLeaveHandler,
];

const QUERY_HANDLERS = [
  GetLeaveByIdHandler,
  ListLeavesHandler,
  GetLeaveBalanceHandler,
  ListLeaveTypesHandler,
  ListHolidaysHandler,
  GetLeaveWorkflowHandler,
  ListPendingLeaveApprovalsHandler,
  GetApprovalHistoryHandler,
  GetLeaveDashboardMetricsHandler,
  GetLeaveChartsHandler,
  GetLeaveReportsHandler,
  ExportLeaveReportHandler,
];

const EVENT_HANDLERS = [
  LeaveWorkflowTriggerHandler,
  LeaveWorkflowCompletedHandler,
  LeaveWorkflowRejectedHandler,
  LeaveIntegrationEventHandler,
];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    WorkflowModule,
    DocumentModule,
    BullModule.registerQueue(
      { name: 'audit.queue' },
      { name: 'notification.queue' },
      { name: 'document.queue' },
    ),
  ],
  controllers: [LeaveController, LeaveReportsController],
  providers: [
    // Infrastructure - Mappers
    LeaveRequestMapper,
    LeaveTypeMapper,
    LeavePolicyMapper,
    LeaveBalanceMapper,
    HolidayMapper,

    // Shared
    PrismaUnitOfWork,

    // Repositories
    {
      provide: 'ILeaveRequestRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: LeaveRequestMapper,
      ) => new PrismaLeaveRequestRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, LeaveRequestMapper],
    },
    {
      provide: 'ILeaveTypeRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: LeaveTypeMapper,
      ) => new PrismaLeaveTypeRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, LeaveTypeMapper],
    },
    {
      provide: 'ILeavePolicyRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: LeavePolicyMapper,
      ) => new PrismaLeavePolicyRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, LeavePolicyMapper],
    },
    {
      provide: 'ILeaveBalanceRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: LeaveBalanceMapper,
      ) => new PrismaLeaveBalanceRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, LeaveBalanceMapper],
    },
    {
      provide: 'IHolidayRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: HolidayMapper,
      ) => new PrismaHolidayRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, HolidayMapper],
    },
    {
      provide: 'IUnitOfWork',
      useExisting: PrismaUnitOfWork,
    },

    // Services
    LeaveBusinessRules,
    LeaveBalanceDomainService,
    LeaveAccrualService,
    LeaveCarryForwardService,
    LeaveDurationCalculator,

    // Handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
  ],
  exports: [
    'ILeaveRequestRepository',
    'ILeaveTypeRepository',
    'ILeavePolicyRepository',
    'ILeaveBalanceRepository',
    'IHolidayRepository',
  ],
})
export class LeaveModule {}
