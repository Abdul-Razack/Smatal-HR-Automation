import {
  BaseBusinessEntity,
  BaseBusinessEntityProps,
} from '../../../../../kernel/domain/models/BaseBusinessEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { FieldOptionEntity } from './FieldOptionEntity';
import { FieldValidationEntity } from './FieldValidationEntity';

export enum FieldDataType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
  FILE = 'FILE',
  JSON = 'JSON',
}

export enum FieldEntityType {
  PROFILE = 'PROFILE',
  CANDIDATE = 'CANDIDATE',
  EMPLOYEE = 'EMPLOYEE',
}

export interface FieldDefinitionProps extends BaseBusinessEntityProps {
  companyId?: Identifier<string> | null;
  machineKey: string;
  displayName: string;
  description?: string | null;
  dataType: FieldDataType;
  entityType: FieldEntityType;
  isSystem: boolean;
  isRequired: boolean;
  defaultValue?: string | null;
  displayOrder: number;
  groupId?: string | null;
  isActive: boolean;

  options?: FieldOptionEntity[];
  validations?: FieldValidationEntity[];
}

export class FieldDefinitionAggregate extends BaseBusinessEntity<FieldDefinitionProps> {
  private constructor(props: FieldDefinitionProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: FieldDefinitionProps,
    id: Identifier<string>,
  ): FieldDefinitionAggregate {
    return new FieldDefinitionAggregate(props, id);
  }

  get companyId(): Identifier<string> | null {
    return this.props.companyId || null;
  }
  get machineKey(): string {
    return this.props.machineKey;
  }
  get displayName(): string {
    return this.props.displayName;
  }
  get description(): string | null {
    return this.props.description || null;
  }
  get dataType(): FieldDataType {
    return this.props.dataType;
  }
  get entityType(): FieldEntityType {
    return this.props.entityType;
  }
  get isSystem(): boolean {
    return this.props.isSystem;
  }
  get isRequired(): boolean {
    return this.props.isRequired;
  }
  get defaultValue(): string | null {
    return this.props.defaultValue || null;
  }
  get displayOrder(): number {
    return this.props.displayOrder;
  }
  get groupId(): string | null {
    return this.props.groupId || null;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }

  get options(): FieldOptionEntity[] {
    return this.props.options || [];
  }
  get validations(): FieldValidationEntity[] {
    return this.props.validations || [];
  }
}
