import { Entity } from '@smatal/kernel/domain/Entity';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export interface DesignationProps {
  businessId: string;
  companyId: string;
  name: string;
  code: string;
  level: number;
  isActive: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class DesignationEntity extends Entity<DesignationProps> {
  private constructor(props: DesignationProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: DesignationProps,
    id: Identifier<string>,
  ): DesignationEntity {
    return new DesignationEntity(props, id);
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
  get level(): number {
    return this.props.level;
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
