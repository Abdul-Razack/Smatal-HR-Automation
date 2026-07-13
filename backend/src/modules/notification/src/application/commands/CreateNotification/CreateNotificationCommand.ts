import { NotificationType } from '../../../domain/enums/NotificationType';

export class CreateNotificationCommand {
  constructor(
    public readonly companyId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly notificationType: NotificationType,
    public readonly priority: string,
    public readonly recipient: string,
  ) {}
}
