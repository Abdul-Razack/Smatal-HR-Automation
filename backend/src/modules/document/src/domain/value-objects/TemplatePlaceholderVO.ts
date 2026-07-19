import { ValueObject } from '../../../../../kernel/domain/ValueObject';

interface TemplatePlaceholderProps {
  id?: string;
  fieldDefinitionId?: string;
  placeholderKey: string;
  isRequired: boolean;
  displayOrder: number;
}

export class TemplatePlaceholderVO extends ValueObject<TemplatePlaceholderProps> {
  private constructor(props: TemplatePlaceholderProps) {
    super(props);
  }

  public static create(props: TemplatePlaceholderProps): TemplatePlaceholderVO {
    return new TemplatePlaceholderVO(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get fieldDefinitionId(): string | undefined {
    return this.props.fieldDefinitionId;
  }

  get placeholderKey(): string {
    return this.props.placeholderKey;
  }

  get isRequired(): boolean {
    return this.props.isRequired;
  }

  get displayOrder(): number {
    return this.props.displayOrder;
  }
}
