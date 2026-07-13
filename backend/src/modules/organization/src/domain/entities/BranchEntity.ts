import { Entity } from '@smatal/kernel/domain/Entity';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export interface BranchProps {
  businessId: string;
  companyId: string;
  name: string;
  code: string;
  isHeadquarters: boolean;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  timezone?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class BranchEntity extends Entity<BranchProps> {
  private constructor(props: BranchProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(props: BranchProps, id: Identifier<string>): BranchEntity {
    return new BranchEntity(props, id);
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
  get isHeadquarters(): boolean {
    return this.props.isHeadquarters;
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
}
