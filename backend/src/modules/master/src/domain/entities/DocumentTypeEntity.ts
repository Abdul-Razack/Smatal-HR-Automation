import {
  TenantIsolatedEntity,
  TenantIsolatedEntityProps,
} from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface DocumentTypeProps extends TenantIsolatedEntityProps {
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
}

export class DocumentTypeEntity extends TenantIsolatedEntity<DocumentTypeProps> {
  private constructor(props: DocumentTypeProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: DocumentTypeProps,
    id: Identifier<string>,
  ): DocumentTypeEntity {
    return new DocumentTypeEntity(props, id);
  }

  get name(): string {
    return this.props.name;
  }
  get code(): string {
    return this.props.code;
  }
  get description(): string | null {
    return this.props.description || null;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }

  updateName(name: string, updatedBy: string): void {
    this.props.name = name;
    this.props.updatedBy = updatedBy;
    this.props.updatedAt = new Date();
    this.incrementVersion();
  }
}
