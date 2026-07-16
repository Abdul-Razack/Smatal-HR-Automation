import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface LeaveAccrualProps {
  leaveBalanceId: Identifier<string>;
  amount: number;
  accrualDate: Date;
  notes?: string | null;
  createdAt: Date;
  createdBy: Identifier<string>;
}

export class LeaveAccrual extends Entity<LeaveAccrualProps> {
  private constructor(props: LeaveAccrualProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: LeaveAccrualProps,
    id: Identifier<string>,
  ): LeaveAccrual {
    return new LeaveAccrual(
      {
        ...props,
        createdAt: props.createdAt || new Date(),
      },
      id,
    );
  }

  get leaveBalanceId(): Identifier<string> {
    return this.props.leaveBalanceId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get accrualDate(): Date {
    return this.props.accrualDate;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get createdBy(): Identifier<string> {
    return this.props.createdBy;
  }
}
