export abstract class BaseRequest {
  public correlationId?: string;
  public tenantId?: string;
}

export abstract class BaseResponse {
  public success: boolean = true;
  public message?: string;
}

export abstract class PagedRequest extends BaseRequest {
  public page: number = 1;
  public limit: number = 10;
  public sortBy?: string;
  public sortOrder?: 'asc' | 'desc';
}

export abstract class PagedResponse<T> extends BaseResponse {
  public data: T[] = [];
  public total: number = 0;
  public page: number = 1;
  public limit: number = 10;
}
