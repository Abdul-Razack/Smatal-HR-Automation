import { Injectable } from '@nestjs/common';
import { EventDispatcher } from '../cqrs/EventDispatcher';
import { AggregateRoot } from '../../domain/AggregateRoot';

@Injectable()
export class EventPublisher {
  constructor(private readonly eventDispatcher: EventDispatcher) {}

  public async publishAggregateEvents(
    aggregate: AggregateRoot<any>,
  ): Promise<void> {
    const events = aggregate.domainEvents;
    if (events && events.length > 0) {
      // Dispatch events asynchronously (in a real system, you might enqueue these)
      await this.eventDispatcher.dispatchAll(events);
      aggregate.clearEvents();
    }
  }
}
