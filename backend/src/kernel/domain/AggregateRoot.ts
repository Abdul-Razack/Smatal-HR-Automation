import { Entity } from './Entity';
import { IDomainEvent } from './DomainEvent';
import { Identifier } from './Identifier';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = [];

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    // Add the event to this aggregate's list of domain events
    this._domainEvents.push(domainEvent);

    // In a full implementation, you might immediately log or enqueue it here,
    // or wait for the Unit of Work to commit and dispatch all domainEvents.
  }

  public clearEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }
}
