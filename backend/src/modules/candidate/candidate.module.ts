import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { WorkflowModule } from '../workflow/workflow.module';

// Domain
import { CandidateDomainService } from './src/domain/services/CandidateDomainService';

// Application — Commands
import { CreateCandidateHandler } from './src/application/commands/CreateCandidate/CreateCandidateHandler';
import { UpdateCandidateHandler } from './src/application/commands/UpdateCandidate/UpdateCandidateHandler';
import { SubmitCandidateHandler } from './src/application/commands/SubmitCandidate/SubmitCandidateHandler';
import { ScreenCandidateHandler } from './src/application/commands/ScreenCandidate/ScreenCandidateHandler';
import { SelectCandidateHandler } from './src/application/commands/SelectCandidate/SelectCandidateHandler';
import { RejectCandidateHandler } from './src/application/commands/RejectCandidate/RejectCandidateHandler';
import { WithdrawCandidateHandler } from './src/application/commands/WithdrawCandidate/WithdrawCandidateHandler';
import { DeleteCandidateHandler } from './src/application/commands/DeleteCandidate/DeleteCandidateHandler';
import { ConvertCandidateHandler } from './src/application/commands/ConvertCandidate/ConvertCandidateHandler';
import { ScheduleInterviewHandler } from './src/application/commands/ScheduleInterview/ScheduleInterviewHandler';
import { UpdateInterviewHandler } from './src/application/commands/UpdateInterview/UpdateInterviewHandler';
import { CancelInterviewHandler } from './src/application/commands/CancelInterview/CancelInterviewHandler';
import { SubmitInterviewFeedbackHandler } from './src/application/commands/SubmitInterviewFeedback/SubmitInterviewFeedbackHandler';
import { GenerateOfferHandler } from './src/application/commands/GenerateOffer/GenerateOfferHandler';
import { UpdateOfferHandler } from './src/application/commands/UpdateOffer/UpdateOfferHandler';
import { AcceptOfferHandler } from './src/application/commands/AcceptOffer/AcceptOfferHandler';
import { RejectOfferHandler } from './src/application/commands/RejectOffer/RejectOfferHandler';

// Application — Queries
import { GetCandidateHandler } from './src/application/queries/GetCandidate/GetCandidateHandler';
import { ListCandidatesHandler } from './src/application/queries/ListCandidates/ListCandidatesHandler';
import { GetCandidateTimelineHandler } from './src/application/queries/GetCandidateTimeline/GetCandidateTimelineHandler';
import { ListInterviewsHandler } from './src/application/queries/ListInterviews/ListInterviewsHandler';
import { GetInterviewHandler } from './src/application/queries/GetInterview/GetInterviewHandler';
import { GetCandidateOffersHandler } from './src/application/queries/GetCandidateOffers/GetCandidateOffersHandler';

// Infrastructure
import { CandidateMapper } from './src/infrastructure/mappers/CandidateMapper';
import { PrismaCandidateRepository } from './src/infrastructure/repositories/PrismaCandidateRepository';
import { PrismaInterviewRepository } from './src/infrastructure/repositories/PrismaInterviewRepository';
import { PrismaOfferRepository } from './src/infrastructure/repositories/PrismaOfferRepository';

// Presentation
import { CandidateController } from './src/presentation/controllers/CandidateController';
import { InterviewController } from './src/presentation/controllers/InterviewController';
import { OfferController } from './src/presentation/controllers/OfferController';

// Application - Event Handlers
import { CandidateIntegrationEventHandler } from './src/application/event-handlers/CandidateIntegrationEventHandler';
import { CandidateWorkflowTriggerHandler } from './src/application/event-handlers/CandidateWorkflowTriggerHandler';

// Infrastructure — Mappers (static only, no DI needed for interview/offer)
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';
import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';

// Employee module (for conversion dependency)
import { EmployeeModule } from '../employee/employee.module';

const COMMAND_HANDLERS = [
  CreateCandidateHandler,
  UpdateCandidateHandler,
  SubmitCandidateHandler,
  ScreenCandidateHandler,
  SelectCandidateHandler,
  RejectCandidateHandler,
  WithdrawCandidateHandler,
  DeleteCandidateHandler,
  ConvertCandidateHandler,
  ScheduleInterviewHandler,
  UpdateInterviewHandler,
  CancelInterviewHandler,
  SubmitInterviewFeedbackHandler,
  GenerateOfferHandler,
  UpdateOfferHandler,
  AcceptOfferHandler,
  RejectOfferHandler,
];

const QUERY_HANDLERS = [
  GetCandidateHandler, 
  ListCandidatesHandler,
  GetCandidateTimelineHandler,
  ListInterviewsHandler,
  GetInterviewHandler,
  GetCandidateOffersHandler,
];

const EVENT_HANDLERS = [
  CandidateIntegrationEventHandler,
  CandidateWorkflowTriggerHandler,
];

@Module({
  imports: [
    CqrsModule,
    DatabaseModule,
    WorkflowModule,
    BullModule.registerQueue({ name: 'audit.queue' }),
    BullModule.registerQueue({ name: 'notification.queue' }),
    BullModule.registerQueue({ name: 'document.queue' }),
    EmployeeModule,
  ],
  controllers: [CandidateController, InterviewController, OfferController],
  providers: [
    // Domain services
    CandidateDomainService,

    // Infrastructure
    CandidateMapper,
    PrismaUnitOfWork,
    {
      provide: 'ICandidateRepository',
      useFactory: (
        uow: PrismaUnitOfWork,
        prisma: PrismaService,
        mapper: CandidateMapper,
      ) => new PrismaCandidateRepository(uow, prisma, mapper),
      inject: [PrismaUnitOfWork, PrismaService, CandidateMapper],
    },
    {
      provide: 'IInterviewRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaInterviewRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IOfferRepository',
      useFactory: (prisma: PrismaService) =>
        new PrismaOfferRepository(prisma),
      inject: [PrismaService],
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
  exports: ['ICandidateRepository'],
})
export class CandidateModule {}
