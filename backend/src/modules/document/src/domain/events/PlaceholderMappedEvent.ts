import { IDomainEvent } from '../../../../../kernel/domain/DomainEvent';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export class PlaceholderMappedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date;

  constructor(
    public readonly templateId: string,
    public readonly versionId: string,
    public readonly companyId: string,
    public readonly mappedCount: number,
    public readonly unmappedCount: number,
    public readonly performedBy: string,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.templateId);
  }
}
