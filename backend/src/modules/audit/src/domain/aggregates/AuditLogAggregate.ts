import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { randomUUID } from 'crypto';
import { AuditAction } from '../enums/AuditAction';

export interface AuditLogProps {
  businessId: string;
  companyId: string;
  entityType: string;
  entityBusinessId: string;
  action: AuditAction;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
  performedBy: string;
  performedAt: Date;
  ipAddress?: string | null;
  correlationId?: string | null;
  remarks?: string | null;
}

export class AuditLogAggregate extends AggregateRoot<AuditLogProps> {
  private constructor(props: AuditLogProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: AuditLogProps,
    id?: Identifier<string>,
  ): AuditLogAggregate {
    return new AuditLogAggregate(
      props,
      id ?? new Identifier<string>(randomUUID()),
    );
  }

  get businessId(): string {
    return this.props.businessId;
  }
  get companyId(): string {
    return this.props.companyId;
  }
  get entityType(): string {
    return this.props.entityType;
  }
  get entityBusinessId(): string {
    return this.props.entityBusinessId;
  }
  get action(): AuditAction {
    return this.props.action;
  }
  get beforeState(): Record<string, any> | null | undefined {
    return this.props.beforeState;
  }
  get afterState(): Record<string, any> | null | undefined {
    return this.props.afterState;
  }
  get performedBy(): string {
    return this.props.performedBy;
  }
  get performedAt(): Date {
    return this.props.performedAt;
  }
  get ipAddress(): string | null | undefined {
    return this.props.ipAddress;
  }
  get correlationId(): string | null | undefined {
    return this.props.correlationId;
  }
  get remarks(): string | null | undefined {
    return this.props.remarks;
  }
}
