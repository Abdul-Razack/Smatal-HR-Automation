import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Domain Services
import { WorkflowDomainService } from './src/domain/services/WorkflowDomainService';

// Repositories
import { PrismaWorkflowDefinitionRepository } from './src/infrastructure/repositories/PrismaWorkflowDefinitionRepository';
import { PrismaWorkflowInstanceRepository } from './src/infrastructure/repositories/PrismaWorkflowInstanceRepository';

// Mappers
import { WorkflowDefinitionMapper } from './src/infrastructure/mappers/WorkflowDefinitionMapper';
import { WorkflowInstanceMapper } from './src/infrastructure/mappers/WorkflowInstanceMapper';

// Services
import { WorkflowSeederService } from './src/application/services/WorkflowSeederService';

// Command Handlers
import {
  CandidateWorkflowTriggerHandler,
} from './src/application/events/LifecycleEventHandlers';

import { CreateWorkflowDefinitionHandler } from './src/application/commands/CreateWorkflowDefinition/CreateWorkflowDefinitionHandler';
import { UpdateWorkflowDefinitionHandler } from './src/application/commands/UpdateWorkflowDefinition/UpdateWorkflowDefinitionHandler';
import { PublishWorkflowDefinitionHandler } from './src/application/commands/PublishWorkflowDefinition/PublishWorkflowDefinitionHandler';
import { ArchiveWorkflowDefinitionHandler } from './src/application/commands/ArchiveWorkflowDefinition/ArchiveWorkflowDefinitionHandler';
import { AddWorkflowStageHandler } from './src/application/commands/AddWorkflowStage/AddWorkflowStageHandler';
import { RemoveWorkflowStageHandler } from './src/application/commands/RemoveWorkflowStage/RemoveWorkflowStageHandler';
import { StartWorkflowInstanceHandler } from './src/application/commands/StartWorkflowInstance/StartWorkflowInstanceHandler';
import { AdvanceWorkflowStageHandler } from './src/application/commands/AdvanceWorkflowStage/AdvanceWorkflowStageHandler';
import { ApproveWorkflowStageHandler } from './src/application/commands/ApproveWorkflowStage/ApproveWorkflowStageHandler';
import { RejectWorkflowStageHandler } from './src/application/commands/RejectWorkflowStage/RejectWorkflowStageHandler';
import { ReturnWorkflowStageHandler } from './src/application/commands/ReturnWorkflowStage/ReturnWorkflowStageHandler';
import { CancelWorkflowInstanceHandler } from './src/application/commands/CancelWorkflowInstance/CancelWorkflowInstanceHandler';

// Sagas
import { WorkflowOrchestrator } from './src/application/sagas/WorkflowOrchestrator';

// Query Handlers
import { GetWorkflowDefinitionHandler } from './src/application/queries/GetWorkflowDefinition/GetWorkflowDefinitionHandler';
import { ListWorkflowDefinitionsHandler } from './src/application/queries/ListWorkflowDefinitions/ListWorkflowDefinitionsHandler';
import { GetWorkflowInstanceHandler } from './src/application/queries/GetWorkflowInstance/GetWorkflowInstanceHandler';
import { ListWorkflowInstancesHandler } from './src/application/queries/ListWorkflowInstances/ListWorkflowInstancesHandler';
import { GetWorkflowHistoryHandler } from './src/application/queries/GetWorkflowHistory/GetWorkflowHistoryHandler';

// Controllers
import { WorkflowDefinitionController } from './src/presentation/controllers/WorkflowDefinitionController';
import { WorkflowInstanceController } from './src/presentation/controllers/WorkflowInstanceController';

// Infrastructure
import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BullModule } from '@nestjs/bullmq';

const CommandHandlers = [
  CreateWorkflowDefinitionHandler,
  UpdateWorkflowDefinitionHandler,
  PublishWorkflowDefinitionHandler,
  ArchiveWorkflowDefinitionHandler,
  AddWorkflowStageHandler,
  RemoveWorkflowStageHandler,
  StartWorkflowInstanceHandler,
  AdvanceWorkflowStageHandler,
  ApproveWorkflowStageHandler,
  RejectWorkflowStageHandler,
  ReturnWorkflowStageHandler,
  CancelWorkflowInstanceHandler,
];

const QueryHandlers = [
  GetWorkflowDefinitionHandler,
  ListWorkflowDefinitionsHandler,
  GetWorkflowInstanceHandler,
  ListWorkflowInstancesHandler,
  GetWorkflowHistoryHandler,
];

const EventHandlers = [
  CandidateWorkflowTriggerHandler,
  WorkflowOrchestrator,
];

const Repositories = [
  {
    provide: 'IWorkflowDefinitionRepository',
    useClass: PrismaWorkflowDefinitionRepository,
  },
  {
    provide: 'IWorkflowInstanceRepository',
    useClass: PrismaWorkflowInstanceRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    BullModule.registerQueue({ name: 'document.queue' }),
    BullModule.registerQueue({ name: 'notification.queue' }),
    BullModule.registerQueue({ name: 'audit.queue' }),
  ],
  controllers: [WorkflowDefinitionController, WorkflowInstanceController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ...Repositories,
    WorkflowDomainService,
    WorkflowDefinitionMapper,
    WorkflowInstanceMapper,
    BusinessIdGenerator,
    PrismaUnitOfWork,
    WorkflowSeederService,
    { provide: 'IUnitOfWork', useClass: PrismaUnitOfWork },
    { provide: 'IBusinessIdGenerator', useClass: BusinessIdGenerator },
  ],
  exports: [
    'IWorkflowDefinitionRepository',
    'IWorkflowInstanceRepository',
    WorkflowDomainService,
    WorkflowSeederService,
  ],
})
export class WorkflowModule {}
