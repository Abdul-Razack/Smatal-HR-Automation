import {
  TenantIsolatedEntity,
  TenantIsolatedEntityProps,
} from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { LeaveAccrualType, CarryForwardType } from '../enums/LeaveEnums';

export interface LeavePolicyProps extends TenantIsolatedEntityProps {
  leaveTypeId: Identifier<string>;
  name: string;
  description: string | null;
  annualEntitlement: number;
  accrualType: LeaveAccrualType;
  carryForwardType: CarryForwardType;
  maxCarryForwardDays: number | null;
  requiresAttachment: boolean;
  minDaysForAttachment: number | null;
  isActive: boolean;
}

export class LeavePolicy extends TenantIsolatedEntity<LeavePolicyProps> {
  private constructor(props: LeavePolicyProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: LeavePolicyProps,
    id: Identifier<string>,
  ): LeavePolicy {
    return new LeavePolicy(props, id);
  }

  get leaveTypeId(): Identifier<string> {
    return this.props.leaveTypeId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get annualEntitlement(): number {
    return this.props.annualEntitlement;
  }

  get accrualType(): LeaveAccrualType {
    return this.props.accrualType;
  }

  get carryForwardType(): CarryForwardType {
    return this.props.carryForwardType;
  }

  get maxCarryForwardDays(): number | null {
    return this.props.maxCarryForwardDays;
  }

  get requiresAttachment(): boolean {
    return this.props.requiresAttachment;
  }

  get minDaysForAttachment(): number | null {
    return this.props.minDaysForAttachment;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
