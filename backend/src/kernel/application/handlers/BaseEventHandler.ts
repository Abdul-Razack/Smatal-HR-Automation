import { IEventHandler, IEvent } from '../../cqrs/cqrs.contracts';

export abstract class BaseEventHandler<
  TEvent extends IEvent,
> implements IEventHandler<TEvent> {
  public async handle(event: TEvent): Promise<void> {
    try {
      await this.process(event);
    } catch (error: any) {
      // In a real system, you might enqueue for retry or dead-letter here.
      console.error(`[EventHandler] Error processing event: ${error.message}`);
    }
  }

  protected abstract process(event: TEvent): Promise<void>;
}
