import { ITransactionContext } from './transaction.interface';

/**
 * Abstracts the Unit of Work (Transaction boundary) from the infrastructure implementation.
 */
export interface IUnitOfWork {
  /**
   * Starts a transaction, executes the callback, and commits if successful.
   * Rollbacks automatically on error.
   */
  withTransaction<T>(work: () => Promise<T>): Promise<T>;

  /**
   * Retrieves the current active transaction context (if any).
   */
  getTransactionContext(): ITransactionContext | undefined;
}
