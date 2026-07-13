import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { randomUUID } from 'crypto';

export interface DocumentTypeProps {
  businessId: string;
  companyId: string;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class DocumentTypeAggregate extends AggregateRoot<DocumentTypeProps> {
  private constructor(props: DocumentTypeProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: DocumentTypeProps,
    id?: Identifier<string>,
  ): DocumentTypeAggregate {
    return new DocumentTypeAggregate(
      props,
      id ?? new Identifier<string>(randomUUID()),
    );
  }

  get businessId(): string {
    return this.props.businessId;
  }
  get companyId(): string {
    return this.props.companyId;
  }
  get name(): string {
    return this.props.name;
  }
  get code(): string {
    return this.props.code;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }
  get version(): number {
    return this.props.version;
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

  public deactivate(performedBy: string): void {
    this.props.isActive = false;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }

  public activate(performedBy: string): void {
    this.props.isActive = true;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }

  public softDelete(performedBy: string): void {
    this.props.isDeleted = true;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }
}
