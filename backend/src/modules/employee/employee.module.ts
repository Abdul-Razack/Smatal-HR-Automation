import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowModule } from '../workflow/workflow.module';

// Domain
import { EmployeeDomainService } from './src/domain/services/EmployeeDomainService';

// Application — Commands
import { CreateEmployeeHandler } from './src/application/commands/CreateEmployee/CreateEmployeeHandler';
import { UpdateEmployeeHandler } from './src/application/commands/UpdateEmployee/UpdateEmployeeHandler';
import { ActivateEmployeeHandler } from './src/application/commands/ActivateEmployee/ActivateEmployeeHandler';
import { TerminateEmployeeHandler } from './src/application/commands/TerminateEmployee/TerminateEmployeeHandler';
import { DeleteEmployeeHandler } from './src/application/commands/DeleteEmployee/DeleteEmployeeHandler';
import { TransitionLifecycleHandler } from './src/application/commands/TransitionLifecycle/TransitionLifecycleHandler';

import { SubmitResignationHandler } from './src/application/commands/SubmitResignation/SubmitResignationHandler';
import { AcceptResignationHandler } from './src/application/commands/AcceptResignation/AcceptResignationHandler';
import { WithdrawResignationHandler } from './src/application/commands/WithdrawResignation/WithdrawResignationHandler';
import { InitiateClearanceHandler } from './src/application/commands/InitiateClearance/InitiateClearanceHandler';
import { UpdateClearanceHandler } from './src/application/commands/UpdateClearance/UpdateClearanceHandler';
import { CompleteExitHandler } from './src/application/commands/CompleteExit/CompleteExitHandler';

// Application — Queries
import { GetEmployeeHandler } from './src/application/queries/GetEmployee/GetEmployeeHandler';
import { ListEmployeesHandler } from './src/application/queries/ListEmployees/ListEmployeesHandler';
import { GetResignationHandler } from './src/application/queries/GetResignation/GetResignationHandler';
import { GetClearanceListHandler } from './src/application/queries/GetClearanceList/GetClearanceListHandler';
import { GetExitOverviewHandler } from './src/application/queries/GetExitOverview/GetExitOverviewHandler';

// Application - Event Handlers
import { EmployeeIntegrationEventHandler } from './src/application/event-handlers/EmployeeIntegrationEventHandler';
import { EmployeeWorkflowTriggerHandler } from './src/application/event-handlers/EmployeeWorkflowTriggerHandler';

// Infrastructure
import { EmployeeMapper } from './src/infrastructure/mappers/EmployeeMapper';
import { PrismaEmployeeRepository } from './src/infrastructure/repositories/PrismaEmployeeRepository';

import { EmployeeController } from './src/presentation/controllers/EmployeeController';

// Employment History
import { GetEmploymentHistoryHandler } from './src/application/queries/GetEmploymentHistory/GetEmploymentHistoryHandler';
import { EmploymentHistoryMapper } from './src/infrastructure/mappers/EmploymentHistoryMapper';
import { PrismaEmploymentHistoryRepository } from './src/infrastructure/repositories/PrismaEmploymentHistoryRepository';

// Infrastructure
import { PrismaService } from '../../infrastructure/database/prisma.service';

import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';
import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';

const COMMAND_HANDLERS = [
  CreateEmployeeHandler,
  UpdateEmployeeHandler,
  ActivateEmployeeHandler,
  TerminateEmployeeHandler,
  DeleteEmployeeHandler,
  TransitionLifecycleHandler,
  SubmitResignationHandler,
  AcceptResignationHandler,
  WithdrawResignationHandler,
  InitiateClearanceHandler,
  UpdateClearanceHandler,
  CompleteExitHandler,
];

const QUERY_HANDLERS = [
  GetEmployeeHandler,
  ListEmployeesHandler,
  GetEmploymentHistoryHandler,
  GetResignationHandler,
  GetClearanceListHandler,
  GetExitOverviewHandler,
];

const EVENT_HANDLERS = [
  EmployeeIntegrationEventHandler,
  EmployeeWorkflowTriggerHandler,
];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    WorkflowModule,
    BullModule.registerQueue({ name: 'audit.queue' }),
    BullModule.registerQueue({ name: 'notification.queue' }),
    BullModule.registerQueue({ name: 'document.queue' }),
  ],
  controllers: [EmployeeController],
  providers: [
    // Domain
    EmployeeDomainService,

    // Infrastructure
    EmployeeMapper,
    EmploymentHistoryMapper,
    PrismaUnitOfWork,
    {
      provide: 'IEmployeeRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: EmployeeMapper,
      ) => new PrismaEmployeeRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, EmployeeMapper],
    },
    {
      provide: 'IEmploymentHistoryRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: EmploymentHistoryMapper,
      ) => new PrismaEmploymentHistoryRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, EmploymentHistoryMapper],
    },
    {
      provide: 'IUnitOfWork',
      useExisting: PrismaUnitOfWork,
    },
    {
      provide: 'IBusinessIdGenerator',
      useClass: BusinessIdGenerator,
    },

    // CQRS handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
  ],
  exports: ['IEmployeeRepository', 'IEmploymentHistoryRepository', EmployeeDomainService, EmployeeMapper, EmploymentHistoryMapper],
})
export class EmployeeModule {}
