import { Entity } from '../Entity';
import { Identifier } from '../Identifier';

export interface IAuditableProps {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

export abstract class AuditableEntity<
  T extends IAuditableProps,
> extends Entity<T> {
  constructor(props: T, id: Identifier<string | number>) {
    super(props, id);
  }
}
