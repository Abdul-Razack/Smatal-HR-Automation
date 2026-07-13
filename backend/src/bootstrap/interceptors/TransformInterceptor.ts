import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PageResult } from '@smatal/shared';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T | PageResult<T>>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T | PageResult<T>>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse (e.g. from a paginated result), pass it through
        if (data instanceof ApiResponse) {
          return data;
        }

        // Wrap generic responses in our standard envelope
        return new ApiResponse<T>(data, {
          timestamp: new Date().toISOString(),
        });
      }),
    );
  }
}
