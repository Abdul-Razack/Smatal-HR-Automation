import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface LeaveCarryForwardProps {
  leaveBalanceId: Identifier<string>;
  fromYear: number;
  amount: number;
  createdAt: Date;
  createdBy: Identifier<string>;
}

export class LeaveCarryForward extends Entity<LeaveCarryForwardProps> {
  private constructor(props: LeaveCarryForwardProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: LeaveCarryForwardProps,
    id: Identifier<string>,
  ): LeaveCarryForward {
    return new LeaveCarryForward(
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

  get fromYear(): number {
    return this.props.fromYear;
  }

  get amount(): number {
    return this.props.amount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get createdBy(): Identifier<string> {
    return this.props.createdBy;
  }
}
