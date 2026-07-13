import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module';

// Domain
import { EmployeeDomainService } from './src/domain/services/EmployeeDomainService';

// Application — Commands
import { UpdateEmployeeHandler } from './src/application/commands/UpdateEmployee/UpdateEmployeeHandler';
import { ActivateEmployeeHandler } from './src/application/commands/ActivateEmployee/ActivateEmployeeHandler';
import { TerminateEmployeeHandler } from './src/application/commands/TerminateEmployee/TerminateEmployeeHandler';
import { DeleteEmployeeHandler } from './src/application/commands/DeleteEmployee/DeleteEmployeeHandler';

// Application — Queries
import { GetEmployeeHandler } from './src/application/queries/GetEmployee/GetEmployeeHandler';
import { ListEmployeesHandler } from './src/application/queries/ListEmployees/ListEmployeesHandler';

// Infrastructure
import { EmployeeMapper } from './src/infrastructure/mappers/EmployeeMapper';
import { PrismaEmployeeRepository } from './src/infrastructure/repositories/PrismaEmployeeRepository';

// Presentation
import { EmployeeController } from './src/presentation/controllers/EmployeeController';

// Infrastructure
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';
import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';

const COMMAND_HANDLERS = [
  UpdateEmployeeHandler,
  ActivateEmployeeHandler,
  TerminateEmployeeHandler,
  DeleteEmployeeHandler,
];

const QUERY_HANDLERS = [GetEmployeeHandler, ListEmployeesHandler];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [EmployeeController],
  providers: [
    // Domain
    EmployeeDomainService,

    // Infrastructure
    EmployeeMapper,
    PrismaService,
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
  exports: ['IEmployeeRepository', EmployeeDomainService, EmployeeMapper],
})
export class EmployeeModule {}
