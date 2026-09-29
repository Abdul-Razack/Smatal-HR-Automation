import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { IdentityModule } from '../../identity/src/identity.module';
import { BusinessIdGenerator } from '../../../infrastructure/database/BusinessIdGenerator';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

// Controllers
import { OrganizationController } from './presentation/controllers/OrganizationController';
import { CompanySettingsController } from './presentation/controllers/CompanySettingsController';
import { LocalStorageAdapter } from '../../../infrastructure/storage/LocalStorageAdapter';

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
import { UpdateCompanySettingsHandler } from './application/commands/UpdateCompanySettingsHandler';
import { UploadCompanyBrandingHandler } from './application/commands/UploadCompanyBrandingHandler';
import { RemoveCompanyBrandingHandler } from './application/commands/RemoveCompanyBrandingHandler';
import {
  GetCompanyByIdHandler,
  ListBranchesHandler,
  ListDepartmentsHandler,
  ListDesignationsHandler,
} from './application/queries/organization.query.handlers';
import { GetCompanySettingsHandler } from './application/queries/GetCompanySettingsHandler';

const CommandHandlers = [
  CreateCompanyHandler,
  CreateBranchHandler,
  CreateDepartmentHandler,
  CreateDesignationHandler,
  UpdateCompanySettingsHandler,
  UploadCompanyBrandingHandler,
  RemoveCompanyBrandingHandler,
];

const QueryHandlers = [
  GetCompanyByIdHandler,
  ListBranchesHandler,
  ListDepartmentsHandler,
  ListDesignationsHandler,
  GetCompanySettingsHandler,
];

const Repositories = [
  { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository },
  { provide: BRANCH_REPOSITORY, useClass: PrismaBranchRepository },
  { provide: DEPARTMENT_REPOSITORY, useClass: PrismaDepartmentRepository },
  { provide: DESIGNATION_REPOSITORY, useClass: PrismaDesignationRepository },
  { provide: 'IStorageService', useClass: LocalStorageAdapter },
];

@Module({
  imports: [CqrsModule, IdentityModule],
  controllers: [OrganizationController, CompanySettingsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    BusinessIdGenerator, // from infrastructure
    PrismaService,
  ],
  exports: [...Repositories],
})
export class OrganizationModule {}
