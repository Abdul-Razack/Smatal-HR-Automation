import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingBehavior implements NestInterceptor {
  private readonly logger = new Logger('CommandPipeline');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const commandName = request.url;
    const now = Date.now();

    this.logger.log(`[CQRS-Start] Executing command/query at ${commandName}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          this.logger.log(
            `[CQRS-End] Finished execution of ${commandName} in ${Date.now() - now}ms`,
          ),
        ),
      );
  }
}
