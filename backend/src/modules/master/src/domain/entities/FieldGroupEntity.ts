import {
  TenantIsolatedEntity,
  TenantIsolatedEntityProps,
} from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface FieldGroupProps extends TenantIsolatedEntityProps {
  name: string;
  description?: string | null;
  displayOrder: number;
}

export class FieldGroupEntity extends TenantIsolatedEntity<FieldGroupProps> {
  private constructor(props: FieldGroupProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: FieldGroupProps,
    id: Identifier<string>,
  ): FieldGroupEntity {
    return new FieldGroupEntity(props, id);
  }

  get name(): string {
    return this.props.name;
  }
  get description(): string | null {
    return this.props.description || null;
  }
  get displayOrder(): number {
    return this.props.displayOrder;
  }
}
