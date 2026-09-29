import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PageResult } from '@smatal/shared';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T | PageResult<T>> | StreamableFile | Buffer
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse, a StreamableFile, or a raw Buffer, pass it through directly
        if (
          data instanceof ApiResponse ||
          data instanceof StreamableFile ||
          Buffer.isBuffer(data)
        ) {
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
