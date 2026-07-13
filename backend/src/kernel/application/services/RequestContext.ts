export class RequestContext {
  constructor(
    public readonly correlationId: string,
    public readonly userId?: string,
    public readonly tenantId?: string,
    public readonly roles?: string[],
  ) {}

  static empty(): RequestContext {
    return new RequestContext('system-generated');
  }
}
