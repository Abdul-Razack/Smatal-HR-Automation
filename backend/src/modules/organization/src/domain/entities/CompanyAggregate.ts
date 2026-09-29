import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface CompanyProps {
  businessId: string;
  name: string;
  legalName?: string | null;
  code: string;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  authorizedPerson?: string | null;
  authorizedPersonDesignation?: string | null;
  signatureUrl?: string | null;
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
  get legalName(): string | null | undefined {
    return this.props.legalName;
  }
  get code(): string {
    return this.props.code;
  }
  get website(): string | null | undefined {
    return this.props.website;
  }
  get address(): string | null | undefined {
    return this.props.address;
  }
  get phone(): string | null | undefined {
    return this.props.phone;
  }
  get email(): string | null | undefined {
    return this.props.email;
  }
  get logoUrl(): string | null | undefined {
    return this.props.logoUrl;
  }
  get authorizedPerson(): string | null | undefined {
    return this.props.authorizedPerson;
  }
  get authorizedPersonDesignation(): string | null | undefined {
    return this.props.authorizedPersonDesignation;
  }
  get signatureUrl(): string | null | undefined {
    return this.props.signatureUrl;
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

  updateSettings(
    data: {
      name?: string;
      legalName?: string | null;
      website?: string | null;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
      industry?: string | null;
      authorizedPerson?: string | null;
      authorizedPersonDesignation?: string | null;
      logoUrl?: string | null;
      signatureUrl?: string | null;
    },
    updatedBy: string,
  ): void {
    if (data.name !== undefined) this.props.name = data.name;
    if (data.legalName !== undefined) this.props.legalName = data.legalName;
    if (data.website !== undefined) this.props.website = data.website;
    if (data.address !== undefined) this.props.address = data.address;
    if (data.phone !== undefined) this.props.phone = data.phone;
    if (data.email !== undefined) this.props.email = data.email;
    if (data.industry !== undefined) this.props.industry = data.industry;
    if (data.authorizedPerson !== undefined) this.props.authorizedPerson = data.authorizedPerson;
    if (data.authorizedPersonDesignation !== undefined)
      this.props.authorizedPersonDesignation = data.authorizedPersonDesignation;
    if (data.logoUrl !== undefined) this.props.logoUrl = data.logoUrl;
    if (data.signatureUrl !== undefined) this.props.signatureUrl = data.signatureUrl;

    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
    this.props.version++;
  }

  setLogo(logoUrl: string | null, updatedBy: string): void {
    this.props.logoUrl = logoUrl;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
    this.props.version++;
  }

  setSignature(signatureUrl: string | null, updatedBy: string): void {
    this.props.signatureUrl = signatureUrl;
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
