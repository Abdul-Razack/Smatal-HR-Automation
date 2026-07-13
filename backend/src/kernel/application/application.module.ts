import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandDispatcher } from './cqrs/CommandDispatcher';
import { QueryDispatcher } from './cqrs/QueryDispatcher';
import { EventDispatcher } from './cqrs/EventDispatcher';
import { MappingRegistry } from './mapping/MappingRegistry';
import { EventPublisher } from './events/EventPublisher';

/**
 * Kernel Application Foundation.
 * Bootstraps standard CQRS and generic architectural bindings globally.
 */
@Global()
@Module({
  imports: [CqrsModule],
  providers: [
    CommandDispatcher,
    QueryDispatcher,
    EventDispatcher,
    MappingRegistry,
    EventPublisher,
  ],
  exports: [
    CqrsModule,
    CommandDispatcher,
    QueryDispatcher,
    EventDispatcher,
    MappingRegistry,
    EventPublisher,
  ],
})
export class ApplicationLayerModule {}
