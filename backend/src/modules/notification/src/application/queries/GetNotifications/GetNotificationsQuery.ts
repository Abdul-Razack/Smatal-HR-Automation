export class GetNotificationsQuery {
  constructor(
    public readonly companyId: string,
    public readonly recipient: string,
    public readonly unreadOnly: boolean = false,
    public readonly limit: number = 50,
    public readonly offset: number = 0,
  ) {}
}
