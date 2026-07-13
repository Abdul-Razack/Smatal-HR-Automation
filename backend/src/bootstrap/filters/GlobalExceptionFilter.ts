import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse, ErrorCode } from '@smatal/shared';
import { DomainException } from '../../kernel/domain/DomainException';
import { AppLogger } from '../../observability/logging/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('GlobalExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const correlationId =
      (request.headers['x-correlation-id'] as string) || 'unknown';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message =
        typeof res === 'string' ? res : res.message || exception.message;
      code =
        status === HttpStatus.BAD_REQUEST
          ? ErrorCode.VALIDATION_FAILED
          : status === HttpStatus.UNAUTHORIZED
            ? ErrorCode.UNAUTHORIZED
            : status === HttpStatus.FORBIDDEN
              ? ErrorCode.FORBIDDEN
              : ErrorCode.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST; // Map domain errors to 400 Bad Request
      message = exception.message;
      code = (exception.code as ErrorCode) || ErrorCode.DOMAIN_RULE_VIOLATION;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${correlationId}] Unhandled exception: ${exception instanceof Error ? exception.message : 'Unknown'}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    const errorResponse = new ApiErrorResponse(
      code,
      message,
      status,
      new Date().toISOString(),
      request.url,
      status === HttpStatus.INTERNAL_SERVER_ERROR &&
        process.env.NODE_ENV !== 'production'
        ? exception instanceof Error
          ? { stack: exception.stack }
          : {}
        : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
