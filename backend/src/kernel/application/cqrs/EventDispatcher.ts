import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IEvent } from '../../cqrs/cqrs.contracts';

@Injectable()
export class EventDispatcher {
  constructor(private readonly eventBus: EventBus) {}

  public async dispatch<TEvent extends IEvent>(event: TEvent): Promise<void> {
    return this.eventBus.publish(event);
  }

  public async dispatchAll<TEvent extends IEvent>(
    events: TEvent[],
  ): Promise<void> {
    return this.eventBus.publishAll(events);
  }
}
