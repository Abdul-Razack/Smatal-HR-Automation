import { IDomainEvent } from '../../../../../kernel/domain/DomainEvent';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export class TemplateImportedEvent implements IDomainEvent {
  public readonly dateTimeOccurred: Date;

  constructor(
    public readonly templateId: string,
    public readonly versionId: string,
    public readonly companyId: string,
    public readonly originalFilename: string,
    public readonly detectedPlaceholders: string[],
    public readonly performedBy: string,
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): Identifier<string> {
    return new Identifier<string>(this.templateId);
  }
}
