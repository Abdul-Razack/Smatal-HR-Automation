import { AuditableEntity, IAuditableProps } from './AuditableEntity';
import { Identifier } from '../Identifier';

export interface ISoftDeletableProps extends IAuditableProps {
  deletedAt?: Date | null;
  deletedBy?: string | null;
  isDeleted: boolean;
}

export abstract class SoftDeletableEntity<
  T extends ISoftDeletableProps,
> extends AuditableEntity<T> {
  constructor(props: T, id: Identifier<string | number>) {
    super(props, id);
  }

  public delete(deletedBy?: string): void {
    if (!this.props.isDeleted) {
      this.props.isDeleted = true;
      this.props.deletedAt = new Date();
      this.props.deletedBy = deletedBy || null;
    }
  }

  public restore(): void {
    if (this.props.isDeleted) {
      this.props.isDeleted = false;
      this.props.deletedAt = null;
      this.props.deletedBy = null;
    }
  }
}
