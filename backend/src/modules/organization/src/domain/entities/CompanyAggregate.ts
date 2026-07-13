import { AggregateRoot } from '@smatal/kernel/domain/AggregateRoot';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export interface CompanyProps {
  businessId: string;
  name: string;
  code: string;
  website?: string | null;
  industry?: string | null;
  registrationNumber?: string | null;
  taxNumber?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class CompanyAggregate extends AggregateRoot<CompanyProps> {
  private constructor(props: CompanyProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(props: CompanyProps, id: Identifier<string>): CompanyAggregate {
    return new CompanyAggregate(props, id);
  }

  get businessId(): string {
    return this.props.businessId;
  }
  get name(): string {
    return this.props.name;
  }
  get code(): string {
    return this.props.code;
  }
  get website(): string | null | undefined {
    return this.props.website;
  }
  get industry(): string | null | undefined {
    return this.props.industry;
  }
  get registrationNumber(): string | null | undefined {
    return this.props.registrationNumber;
  }
  get taxNumber(): string | null | undefined {
    return this.props.taxNumber;
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

  updateProfile(
    name: string,
    website: string | null,
    industry: string | null,
    updatedBy: string,
  ): void {
    this.props.name = name;
    this.props.website = website;
    this.props.industry = industry;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
    this.props.version++;
  }

  deactivate(updatedBy: string): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
    this.props.version++;
  }
}
