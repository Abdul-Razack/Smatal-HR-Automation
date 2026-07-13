import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from '../prisma.service';
import { IUnitOfWork } from './IUnitOfWork';
import { ITransactionContext } from './transaction.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  // CLS hook to implicitly pass the transaction client (tx) without exposing it in method signatures
  private readonly als = new AsyncLocalStorage<ITransactionContext>();

  constructor(private readonly prisma: PrismaService) {}

  public async withTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Run the work callback within the AsyncLocalStorage context containing the tx client
        return this.als.run(tx as ITransactionContext, async () => {
          return await work();
        });
      },
      {
        maxWait: 5000,
        timeout: 10000, // Timeout configurable based on env
      },
    );
  }

  public getTransactionContext(): ITransactionContext | undefined {
    return this.als.getStore();
  }
}
