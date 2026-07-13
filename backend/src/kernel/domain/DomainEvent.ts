import { Identifier } from './Identifier';

export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): Identifier<string | number>;
}
