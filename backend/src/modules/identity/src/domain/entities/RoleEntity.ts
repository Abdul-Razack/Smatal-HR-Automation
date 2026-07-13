import { Entity } from '@smatal/kernel/domain/Entity';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export interface RoleProps {
  businessId: string;
  companyId: string;
  name: string;
  code: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class RoleEntity extends Entity<RoleProps> {
  private constructor(props: RoleProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(props: RoleProps, id: Identifier<string>): RoleEntity {
    return new RoleEntity(props, id);
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
  get isSystem(): boolean {
    return this.props.isSystem;
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
