import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { LeaveStatus } from '../enums/LeaveEnums';

export interface LeaveHistoryProps {
  leaveRequestId: Identifier<string>;
  status: LeaveStatus;
  action: string;
  notes?: string | null;
  performedBy: Identifier<string>;
  performedAt: Date;
  metadata?: any;
}

export class LeaveHistory extends Entity<LeaveHistoryProps> {
  private constructor(props: LeaveHistoryProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: LeaveHistoryProps,
    id: Identifier<string>,
  ): LeaveHistory {
    return new LeaveHistory(
      {
        ...props,
        performedAt: props.performedAt || new Date(),
      },
      id,
    );
  }

  get leaveRequestId(): Identifier<string> {
    return this.props.leaveRequestId;
  }

  get status(): LeaveStatus {
    return this.props.status;
  }

  get action(): string {
    return this.props.action;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get performedBy(): Identifier<string> {
    return this.props.performedBy;
  }

  get performedAt(): Date {
    return this.props.performedAt;
  }

  get metadata(): any {
    return this.props.metadata;
  }
}
