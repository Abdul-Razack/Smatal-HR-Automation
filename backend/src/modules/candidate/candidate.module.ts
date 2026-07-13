import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module';

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

// Application — Queries
import { GetCandidateHandler } from './src/application/queries/GetCandidate/GetCandidateHandler';
import { ListCandidatesHandler } from './src/application/queries/ListCandidates/ListCandidatesHandler';

// Infrastructure
import { CandidateMapper } from './src/infrastructure/mappers/CandidateMapper';
import { PrismaCandidateRepository } from './src/infrastructure/repositories/PrismaCandidateRepository';

// Presentation
import { CandidateController } from './src/presentation/controllers/CandidateController';

// Infrastructure imports from sibling modules
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
];

const QUERY_HANDLERS = [GetCandidateHandler, ListCandidatesHandler];

@Module({
  imports: [CqrsModule, DatabaseModule, EmployeeModule],
  controllers: [CandidateController],
  providers: [
    // Domain services
    CandidateDomainService,

    // Infrastructure
    CandidateMapper,
    PrismaService,
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
  ],
  exports: ['ICandidateRepository'],
})
export class CandidateModule {}
