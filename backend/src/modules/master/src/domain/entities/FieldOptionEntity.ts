import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface FieldOptionProps {
  fieldDefinitionId: string;
  label: string;
  value: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class FieldOptionEntity extends Entity<FieldOptionProps> {
  private constructor(props: FieldOptionProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: FieldOptionProps,
    id: Identifier<string>,
  ): FieldOptionEntity {
    return new FieldOptionEntity(props, id);
  }

  get fieldDefinitionId(): string {
    return this.props.fieldDefinitionId;
  }
  get label(): string {
    return this.props.label;
  }
  get value(): string {
    return this.props.value;
  }
  get displayOrder(): number {
    return this.props.displayOrder;
  }
  get isActive(): boolean {
    return this.props.isActive;
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
