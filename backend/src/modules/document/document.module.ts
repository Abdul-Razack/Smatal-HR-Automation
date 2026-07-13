import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { MasterModule } from '../master/master.module';

// Mappers
import { DocumentTypeMapper } from './src/infrastructure/mappers/DocumentTypeMapper';
import { TemplateMapper } from './src/infrastructure/mappers/TemplateMapper';
import { GeneratedDocumentMapper } from './src/infrastructure/mappers/GeneratedDocumentMapper';

// Repositories
import { PrismaDocumentTypeRepository } from './src/infrastructure/repositories/PrismaDocumentTypeRepository';
import { PrismaTemplateRepository } from './src/infrastructure/repositories/PrismaTemplateRepository';
import { PrismaGeneratedDocumentRepository } from './src/infrastructure/repositories/PrismaGeneratedDocumentRepository';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';
import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';

// Services
import { DocumentDomainService } from './src/domain/services/DocumentDomainService';
import { DocumentGeneratorService } from './src/infrastructure/services/DocumentGeneratorService';

// Command Handlers
import { CreateDocumentTypeHandler } from './src/application/commands/CreateDocumentType/CreateDocumentTypeHandler';
import { CreateTemplateHandler } from './src/application/commands/CreateTemplate/CreateTemplateHandler';
import { CreateTemplateVersionHandler } from './src/application/commands/CreateTemplateVersion/CreateTemplateVersionHandler';
import { PublishTemplateVersionHandler } from './src/application/commands/PublishTemplateVersion/PublishTemplateVersionHandler';
import { GenerateDocumentHandler } from './src/application/commands/GenerateDocument/GenerateDocumentHandler';

// Query Handlers
import { GetTemplateHandler } from './src/application/queries/GetTemplate/GetTemplateHandler';
import { GetGeneratedDocumentHandler } from './src/application/queries/GetGeneratedDocument/GetGeneratedDocumentHandler';

// Controllers
import { DocumentTypeController } from './src/presentation/controllers/DocumentTypeController';
import { TemplateController } from './src/presentation/controllers/TemplateController';
import { GeneratedDocumentController } from './src/presentation/controllers/GeneratedDocumentController';

const CommandHandlers = [
  CreateDocumentTypeHandler,
  CreateTemplateHandler,
  CreateTemplateVersionHandler,
  PublishTemplateVersionHandler,
  GenerateDocumentHandler,
];

const QueryHandlers = [GetTemplateHandler, GetGeneratedDocumentHandler];

const Repositories = [
  {
    provide: 'IDocumentTypeRepository',
    useClass: PrismaDocumentTypeRepository,
  },
  { provide: 'ITemplateRepository', useClass: PrismaTemplateRepository },
  {
    provide: 'IGeneratedDocumentRepository',
    useClass: PrismaGeneratedDocumentRepository,
  },
  { provide: 'IUnitOfWork', useClass: PrismaUnitOfWork },
  { provide: 'IBusinessIdGenerator', useClass: BusinessIdGenerator },
];

@Module({
  imports: [CqrsModule, DatabaseModule, MasterModule],
  controllers: [
    DocumentTypeController,
    TemplateController,
    GeneratedDocumentController,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    DocumentTypeMapper,
    TemplateMapper,
    GeneratedDocumentMapper,
    DocumentDomainService,
    DocumentGeneratorService,
    PrismaUnitOfWork,
    BusinessIdGenerator,
  ],
  exports: [
    'IDocumentTypeRepository',
    'ITemplateRepository',
    'IGeneratedDocumentRepository',
    DocumentGeneratorService,
  ],
})
export class DocumentModule {}
