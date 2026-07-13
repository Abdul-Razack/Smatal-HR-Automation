import { Entity } from '../Entity';
import { Identifier } from '../Identifier';

import { IBusinessIdentifiable } from './IBusinessIdentifiable';

export interface BaseBusinessEntityProps {
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;

  isDeleted: boolean;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

/**
 * The root abstract class for all Global Business Entities (e.g., Profile, Global Document Type).
 * Combines standard DDD ID handling with Audit, Soft Delete, and Business ID patterns.
 */
export abstract class BaseBusinessEntity<T extends BaseBusinessEntityProps>
  extends Entity<T>
  implements IBusinessIdentifiable
{
  get businessId(): string {
    return this.props.businessId;
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

  get version(): number {
    return this.props.version;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }

  get deletedBy(): string | null | undefined {
    return this.props.deletedBy;
  }

  /**
   * Increments the optimistic concurrency version.
   */
  public incrementVersion(): void {
    this.props.version++;
    this.props.updatedAt = new Date();
  }

  /**
   * Marks the entity as logically deleted.
   */
  public markAsDeleted(deletedBy: string): void {
    this.props.isDeleted = true;
    this.props.deletedAt = new Date();
    this.props.deletedBy = deletedBy;
    this.props.updatedAt = new Date();
    this.props.updatedBy = deletedBy;
  }
}
