import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrismaUnitOfWork } from '../../../infrastructure/database/transaction/PrismaUnitOfWork';

@Injectable()
export class TransactionBehavior implements NestInterceptor {
  constructor(private readonly uow: PrismaUnitOfWork) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // If command requires transaction, wrap it in UoW
    // Note: We could check custom decorators (e.g. @Transactional) here using Reflector
    return from(
      this.uow.withTransaction(async () => {
        // Execute the handler inside the transaction boundary
        // Events will be published after handlers execute by the pipeline or handler itself.
        return next.handle().toPromise();
      }),
    );
  }
}
