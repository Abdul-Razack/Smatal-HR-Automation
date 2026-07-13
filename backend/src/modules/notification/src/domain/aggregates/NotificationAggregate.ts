import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { randomUUID } from 'crypto';
import { NotificationType } from '../enums/NotificationType';

export interface NotificationProps {
  businessId: string;
  companyId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  priority: string; // e.g., 'HIGH', 'NORMAL', 'LOW'
  recipient: string; // The userId or role receiving it
  readStatus: boolean;
  createdAt: Date;
}

export class NotificationAggregate extends AggregateRoot<NotificationProps> {
  private constructor(props: NotificationProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: NotificationProps,
    id?: Identifier<string>,
  ): NotificationAggregate {
    return new NotificationAggregate(
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
  get title(): string {
    return this.props.title;
  }
  get message(): string {
    return this.props.message;
  }
  get notificationType(): NotificationType {
    return this.props.notificationType;
  }
  get priority(): string {
    return this.props.priority;
  }
  get recipient(): string {
    return this.props.recipient;
  }
  get readStatus(): boolean {
    return this.props.readStatus;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  public markAsRead(): void {
    if (!this.props.readStatus) {
      this.props.readStatus = true;
      // You could emit a domain event here like NotificationReadEvent
    }
  }
}
