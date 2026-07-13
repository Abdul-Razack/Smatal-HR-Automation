export class ApiResponse<T> {
  constructor(
    public readonly data: T,
    public readonly meta?: Record<string, any>,
    public readonly message?: string,
  ) {}
}

export class ApiErrorResponse {
  constructor(
    public readonly error: string,
    public readonly message: string,
    public readonly statusCode: number,
    public readonly timestamp: string,
    public readonly path: string,
    public readonly details?: Record<string, any>,
  ) {}
}
