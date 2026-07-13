import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export enum ValidationRuleType {
  REQUIRED = 'REQUIRED',
  REGEX = 'REGEX',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  MIN_VALUE = 'MIN_VALUE',
  MAX_VALUE = 'MAX_VALUE',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  CUSTOM = 'CUSTOM',
}

export interface FieldValidationProps {
  fieldDefinitionId: string;
  ruleType: ValidationRuleType;
  ruleValue: string;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class FieldValidationEntity extends Entity<FieldValidationProps> {
  private constructor(props: FieldValidationProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: FieldValidationProps,
    id: Identifier<string>,
  ): FieldValidationEntity {
    return new FieldValidationEntity(props, id);
  }

  get fieldDefinitionId(): string {
    return this.props.fieldDefinitionId;
  }
  get ruleType(): ValidationRuleType {
    return this.props.ruleType;
  }
  get ruleValue(): string {
    return this.props.ruleValue;
  }
  get errorMessage(): string | null {
    return this.props.errorMessage || null;
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
