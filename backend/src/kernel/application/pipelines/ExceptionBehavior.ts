import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DomainException } from '../../domain/DomainException';

@Injectable()
export class ExceptionBehavior implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof DomainException) {
          // Translate domain exception to expected structure (will be caught by GlobalExceptionFilter)
          return throwError(() => err);
        }
        // Log unhandled exceptions
        return throwError(
          () =>
            new InternalServerErrorException(
              'An unexpected error occurred during execution',
            ),
        );
      }),
    );
  }
}
