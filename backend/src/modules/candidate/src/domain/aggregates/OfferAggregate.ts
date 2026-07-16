import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { OfferStatus, OFFER_STATUS_TRANSITIONS } from '../enums/OfferStatus';
import {
  OfferGeneratedEvent,
  OfferAcceptedEvent,
  OfferRejectedEvent,
} from '../events/CandidateEvents';

export interface OfferProps extends TenantIsolatedEntityProps {
  candidateId: string;
  status: OfferStatus;
  baseSalary?: number | null;
  currency?: string | null;
  joiningDate?: Date | null;
  validUntil?: Date | null;
  notes?: string | null;
  generatedDocumentId?: string | null;
}

export class OfferAggregate extends AggregateRoot<OfferProps> {
  private constructor(props: OfferProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(props: OfferProps, id: Identifier<string>, performedBy: string): OfferAggregate {
    const offer = new OfferAggregate(props, id);
    offer.addDomainEvent(
      new OfferGeneratedEvent(
        id.toString(),
        props.candidateId,
        props.companyId.toString(),
        props.businessId,
        performedBy,
      ),
    );
    return offer;
  }

  static reconstitute(props: OfferProps, id: Identifier<string>): OfferAggregate {
    return new OfferAggregate(props, id);
  }

  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get candidateId(): string {
    return this.props.candidateId;
  }
  get status(): OfferStatus {
    return this.props.status;
  }
  get baseSalary(): number | null | undefined {
    return this.props.baseSalary;
  }
  get currency(): string | null | undefined {
    return this.props.currency;
  }
  get joiningDate(): Date | null | undefined {
    return this.props.joiningDate;
  }
  get validUntil(): Date | null | undefined {
    return this.props.validUntil;
  }
  get notes(): string | null | undefined {
    return this.props.notes;
  }
  get generatedDocumentId(): string | null | undefined {
    return this.props.generatedDocumentId;
  }
  get version(): number {
    return this.props.version;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }
  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }
  get deletedBy(): string | null | undefined {
    return this.props.deletedBy;
  }

  update(
    baseSalary: number | null | undefined,
    currency: string | null | undefined,
    joiningDate: Date | null | undefined,
    validUntil: Date | null | undefined,
    notes: string | null | undefined,
    performedBy: string,
  ): void {
    if (this.props.isDeleted) throw new Error('Cannot update deleted offer');
    if (this.props.status !== OfferStatus.DRAFT) throw new Error('Cannot update offer after it is generated');
    
    this.props.baseSalary = baseSalary;
    this.props.currency = currency;
    this.props.joiningDate = joiningDate;
    this.props.validUntil = validUntil;
    this.props.notes = notes;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  private transitionStatus(newStatus: OfferStatus, performedBy: string): void {
    if (this.props.isDeleted) throw new Error('Cannot update deleted offer');
    const allowed = OFFER_STATUS_TRANSITIONS[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from ${this.props.status} to ${newStatus}`);
    }
    this.props.status = newStatus;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  markGenerated(documentId: string, performedBy: string): void {
    this.transitionStatus(OfferStatus.GENERATED, performedBy);
    this.props.generatedDocumentId = documentId;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  send(performedBy: string): void {
    this.transitionStatus(OfferStatus.SENT, performedBy);
  }

  accept(performedBy: string): void {
    this.transitionStatus(OfferStatus.ACCEPTED, performedBy);
    this.addDomainEvent(
      new OfferAcceptedEvent(
        this.id.toString(),
        this.props.candidateId,
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  reject(performedBy: string): void {
    this.transitionStatus(OfferStatus.REJECTED, performedBy);
    this.addDomainEvent(
      new OfferRejectedEvent(
        this.id.toString(),
        this.props.candidateId,
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  withdraw(performedBy: string): void {
    this.transitionStatus(OfferStatus.WITHDRAWN, performedBy);
  }

  softDelete(performedBy: string): void {
    if (this.props.status !== OfferStatus.DRAFT && this.props.status !== OfferStatus.WITHDRAWN) {
      throw new Error('Cannot delete active offer');
    }
    this.props.isDeleted = true;
    this.props.deletedAt = new Date();
    this.props.deletedBy = performedBy;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }
}
