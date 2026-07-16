import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { LeaveBalanceType } from '../enums/LeaveEnums';

// LeaveBalance in the Prisma schema doesn't use the soft-delete pattern,
// so we use a plain Entity rather than BaseBusinessEntity.
export interface LeaveBalanceProps {
  businessId: string;
  companyId: Identifier<string>;
  employeeId: Identifier<string>;
  leaveTypeId: Identifier<string>;
  year: number;
  balanceType: LeaveBalanceType;
  totalEntitlement: number;
  accruedDays: number;
  carriedForward: number;
  usedDays: number;
  pendingDays: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class LeaveBalance extends Entity<LeaveBalanceProps> {
  private constructor(props: LeaveBalanceProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: LeaveBalanceProps,
    id: Identifier<string>,
  ): LeaveBalance {
    return new LeaveBalance(props, id);
  }

  get businessId(): string {
    return this.props.businessId;
  }

  get companyId(): Identifier<string> {
    return this.props.companyId;
  }

  get employeeId(): Identifier<string> {
    return this.props.employeeId;
  }

  get leaveTypeId(): Identifier<string> {
    return this.props.leaveTypeId;
  }

  get year(): number {
    return this.props.year;
  }

  get balanceType(): LeaveBalanceType {
    return this.props.balanceType;
  }

  get totalEntitlement(): number {
    return this.props.totalEntitlement;
  }

  get accruedDays(): number {
    return this.props.accruedDays;
  }

  get carriedForward(): number {
    return this.props.carriedForward;
  }

  get usedDays(): number {
    return this.props.usedDays;
  }

  get pendingDays(): number {
    return this.props.pendingDays;
  }

  get version(): number {
    return this.props.version;
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

  get remainingBalance(): number {
    return (
      this.totalEntitlement +
      this.carriedForward +
      this.accruedDays -
      this.usedDays
    );
  }

  get availableBalance(): number {
    return this.remainingBalance - this.pendingDays;
  }
}
