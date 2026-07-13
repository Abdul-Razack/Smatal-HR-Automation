export class MarkNotificationReadCommand {
  constructor(
    public readonly companyId: string,
    public readonly notificationId: string,
    public readonly userId: string, // to ensure ownership
  ) {}
}
