import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaFieldDefinitionRepository } from './src/infrastructure/repositories/PrismaFieldDefinitionRepository';
import { PrismaFieldGroupRepository } from './src/infrastructure/repositories/PrismaFieldGroupRepository';
import { PrismaDocumentTypeRepository } from './src/infrastructure/repositories/PrismaDocumentTypeRepository';
import { CreateFieldDefinitionHandler } from './src/application/commands/CreateFieldDefinition/CreateFieldDefinitionHandler';
import { CreateFieldGroupHandler } from './src/application/commands/CreateFieldGroup/CreateFieldGroupHandler';
import { CreateDocumentTypeHandler } from './src/application/commands/CreateDocumentType/CreateDocumentTypeHandler';
import { FieldRegistryController } from './src/presentation/controllers/FieldRegistryController';

// Runtime
import { FieldRuntimeService } from './src/runtime/FieldRuntimeService';

import { BusinessIdGenerator } from '../../infrastructure/database/BusinessIdGenerator';
import { PrismaUnitOfWork } from '../../infrastructure/database/transaction/PrismaUnitOfWork';

const CommandHandlers = [
  CreateFieldDefinitionHandler,
  CreateFieldGroupHandler,
  CreateDocumentTypeHandler,
];

const Repositories = [
  {
    provide: 'IFieldDefinitionRepository',
    useClass: PrismaFieldDefinitionRepository,
  },
  {
    provide: 'IFieldGroupRepository',
    useClass: PrismaFieldGroupRepository,
  },
  {
    provide: 'IDocumentTypeRepository',
    useClass: PrismaDocumentTypeRepository,
  },
];

@Module({
  imports: [CqrsModule],
  controllers: [FieldRegistryController],
  providers: [
    ...CommandHandlers,
    ...Repositories,
    FieldRuntimeService,
    BusinessIdGenerator,
    PrismaUnitOfWork,
    { provide: 'IUnitOfWork', useClass: PrismaUnitOfWork },
    { provide: 'IBusinessIdGenerator', useClass: BusinessIdGenerator },
  ],
  exports: [...Repositories, FieldRuntimeService],
})
export class MasterModule {}
