import { Entity } from '@smatal/kernel/domain/Entity';
import { Identifier } from '@smatal/kernel/domain/Identifier';

export interface DepartmentProps {
  businessId: string;
  companyId: string;
  name: string;
  code: string;
  parentId?: string | null;
  managerId?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class DepartmentEntity extends Entity<DepartmentProps> {
  private constructor(props: DepartmentProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: DepartmentProps,
    id: Identifier<string>,
  ): DepartmentEntity {
    return new DepartmentEntity(props, id);
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
  get parentId(): string | null | undefined {
    return this.props.parentId;
  }
  get managerId(): string | null | undefined {
    return this.props.managerId;
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
