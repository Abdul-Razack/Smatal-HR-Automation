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

// Services (V1 — unchanged)
import { DocumentDomainService } from './src/domain/services/DocumentDomainService';

// V2: Storage infrastructure
import { LocalStorageAdapter } from '../../infrastructure/storage/LocalStorageAdapter';
import { S3StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter';
import { StorageFactory } from '../../infrastructure/storage/StorageFactory';
import { PdfConverterService } from './src/infrastructure/services/PdfConverterService';

// V2: Generators

import { DocxGeneratorStrategy } from './src/infrastructure/generators/DocxGeneratorStrategy';
import { DocumentGeneratorFactory } from './src/infrastructure/generators/DocumentGeneratorFactory';

// V2: Document parsers
import { PlaceholderScanner } from './src/infrastructure/parsers/PlaceholderScanner';
import { DocxParser } from './src/infrastructure/parsers/DocxParser';

// Command Handlers (V1 — unchanged)
import { CreateDocumentTypeHandler } from './src/application/commands/CreateDocumentType/CreateDocumentTypeHandler';
import { CreateTemplateHandler } from './src/application/commands/CreateTemplate/CreateTemplateHandler';

import { PublishTemplateVersionHandler } from './src/application/commands/PublishTemplateVersion/PublishTemplateVersionHandler';
import { GenerateDocumentHandler } from './src/application/commands/GenerateDocument/GenerateDocumentHandler';

// Command Handlers (V2 — new)
import { ImportTemplateVersionHandler } from './src/application/commands/ImportTemplateVersion/ImportTemplateVersionHandler';
import { MapTemplatePlaceholdersHandler } from './src/application/commands/MapTemplatePlaceholders/MapTemplatePlaceholdersHandler';
import { DeleteTemplateVersionCommandHandler } from './src/application/commands/DeleteTemplateVersion/DeleteTemplateVersionCommandHandler';

// Query Handlers (V1 — unchanged)
import { GetTemplateHandler } from './src/application/queries/GetTemplate/GetTemplateHandler';
import { GetGeneratedDocumentHandler } from './src/application/queries/GetGeneratedDocument/GetGeneratedDocumentHandler';
import { GetAllGeneratedDocumentsHandler } from './src/application/queries/GetAllGeneratedDocuments/GetAllGeneratedDocumentsHandler';

// Workers
import { DocumentWorker } from './src/application/workers/DocumentWorker';

// Query Handlers (V2 — new)
import { GetTemplatePlaceholdersHandler } from './src/application/queries/GetTemplatePlaceholders/GetTemplatePlaceholdersHandler';
import { GetAllTemplatesHandler } from './src/application/queries/GetAllTemplates/GetAllTemplatesHandler';
import { GetGlobalPlaceholdersHandler } from './src/application/queries/GetGlobalPlaceholders/GetGlobalPlaceholdersHandler';

// Services (V2 — new)
import { PlaceholderRegistryService } from './src/domain/services/PlaceholderRegistryService';
import { AutomaticResolverService } from './src/domain/services/AutomaticResolverService';
import { HtmlConverterService } from './src/infrastructure/services/HtmlConverterService';

// Controllers
import { DocumentTypeController } from './src/presentation/controllers/DocumentTypeController';
import { TemplateController } from './src/presentation/controllers/TemplateController';
import { GeneratedDocumentController } from './src/presentation/controllers/GeneratedDocumentController';
import { DocumentDownloadController } from './src/presentation/controllers/DocumentDownloadController';

// V2: Phase 3 Orchestration
import { GenerationOrchestrator } from './src/application/services/GenerationOrchestrator';
import { ImmediateDispatcher } from './src/application/dispatchers/ImmediateDispatcher';
import { TemplateLoader } from './src/infrastructure/services/TemplateLoader';
import { GenerationValidator } from './src/domain/services/GenerationValidator';
import { DocumentSnapshotBuilder } from './src/domain/builders/DocumentSnapshotBuilder';
import { PrismaEntityDataProvider } from './src/infrastructure/data/PrismaEntityDataProvider';

import { PreviewTemplateHandler } from './src/application/queries/PreviewTemplate/PreviewTemplateHandler';
import { PreviewUploadedTemplateHandler } from './src/application/queries/PreviewUploadedTemplate/PreviewUploadedTemplateHandler';

const CommandHandlers = [
  // V1
  CreateDocumentTypeHandler,
  CreateTemplateHandler,

  PublishTemplateVersionHandler,
  GenerateDocumentHandler,
  // V2
  ImportTemplateVersionHandler,
  MapTemplatePlaceholdersHandler,
  DeleteTemplateVersionCommandHandler,
];

const QueryHandlers = [
  // V1
  GetTemplateHandler,
  GetGeneratedDocumentHandler,
  GetAllGeneratedDocumentsHandler,
  // V2
  GetTemplatePlaceholdersHandler,
  GetAllTemplatesHandler,
  GetGlobalPlaceholdersHandler,
  PreviewTemplateHandler,
  PreviewUploadedTemplateHandler,
];

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
    DocumentDownloadController,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    // Mappers
    DocumentTypeMapper,
    TemplateMapper,
    GeneratedDocumentMapper,
    // Services (V1)
    DocumentDomainService,
    PdfConverterService,
    PrismaUnitOfWork,
    BusinessIdGenerator,
    // V2: Storage
    LocalStorageAdapter,
    S3StorageAdapter,
    StorageFactory,
    { provide: 'IStorageService', useClass: LocalStorageAdapter },
    PlaceholderRegistryService,
    AutomaticResolverService,
    HtmlConverterService,
    PrismaEntityDataProvider,
    // V2: Parsers
    PlaceholderScanner,
    DocxParser,
    // V2: Generators
    DocxGeneratorStrategy,
    {
      provide: 'DOCUMENT_GENERATOR_STRATEGIES',
      useFactory: (docx: DocxGeneratorStrategy) => [docx],
      inject: [DocxGeneratorStrategy],
    },
    DocumentGeneratorFactory,
    // V2: Orchestration (Phase 3)
    GenerationOrchestrator,
    ImmediateDispatcher,
    TemplateLoader,
    GenerationValidator,
    DocumentSnapshotBuilder,
    DocumentWorker,
  ],
  exports: [
    'IDocumentTypeRepository',
    'ITemplateRepository',
    'IGeneratedDocumentRepository',
    GenerationOrchestrator,
    ImmediateDispatcher,
    // V2 exports (for future cross-module use)
    StorageFactory,
    DocxParser,
    PdfConverterService,
  ],
})
export class DocumentModule {}
