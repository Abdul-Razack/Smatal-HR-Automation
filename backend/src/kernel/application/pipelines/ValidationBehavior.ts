import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
// In a full implementation, this intercepts the request before it reaches the Command Bus
// and runs the data through the generic IValidator pipeline.

@Injectable()
export class ValidationBehavior implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    // Validate request payload using registered validators...
    return next.handle();
  }
}
