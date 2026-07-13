import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from '../../identity/src/identity.module';
import { BusinessIdGenerator } from '../../../infrastructure/database/BusinessIdGenerator';

// Controllers
import { OrganizationController } from './presentation/controllers/OrganizationController';

// Repositories
import { COMPANY_REPOSITORY } from './domain/repositories/ICompanyRepository';
import { PrismaCompanyRepository } from './infrastructure/repositories/PrismaCompanyRepository';
import { BRANCH_REPOSITORY } from './domain/repositories/IBranchRepository';
import { PrismaBranchRepository } from './infrastructure/repositories/PrismaBranchRepository';
import { DEPARTMENT_REPOSITORY } from './domain/repositories/IDepartmentRepository';
import { PrismaDepartmentRepository } from './infrastructure/repositories/PrismaDepartmentRepository';
import { DESIGNATION_REPOSITORY } from './domain/repositories/IDesignationRepository';
import { PrismaDesignationRepository } from './infrastructure/repositories/PrismaDesignationRepository';

// Handlers
import {
  CreateCompanyHandler,
  CreateBranchHandler,
  CreateDepartmentHandler,
  CreateDesignationHandler,
} from './application/commands/organization.handlers';
import {
  GetCompanyByIdHandler,
  ListBranchesHandler,
  ListDepartmentsHandler,
  ListDesignationsHandler,
} from './application/queries/organization.query.handlers';

const CommandHandlers = [
  CreateCompanyHandler,
  CreateBranchHandler,
  CreateDepartmentHandler,
  CreateDesignationHandler,
];

const QueryHandlers = [
  GetCompanyByIdHandler,
  ListBranchesHandler,
  ListDepartmentsHandler,
  ListDesignationsHandler,
];

const Repositories = [
  { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
  { provide: BRANCH_REPOSITORY, useClass: PrismaBranchRepository },
  { provide: DEPARTMENT_REPOSITORY, useClass: PrismaDepartmentRepository },
  { provide: DESIGNATION_REPOSITORY, useClass: PrismaDesignationRepository },
];

@Module({
  imports: [CqrsModule, IdentityModule],
  controllers: [OrganizationController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    BusinessIdGenerator, // from infrastructure
  ],
  exports: [...Repositories],
})
export class OrganizationModule {}
