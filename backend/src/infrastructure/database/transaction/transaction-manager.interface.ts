import { ITransactionContext } from './transaction.interface';

/**
 * Interface for executing a callback within a managed transaction context.
 * The underlying infrastructure will supply the concrete ITransactionContext.
 */
export interface ITransactionManager {
  execute<T>(
    operation: (context: ITransactionContext) => Promise<T>,
  ): Promise<T>;
}
