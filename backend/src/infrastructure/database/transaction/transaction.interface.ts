/**
 * Represents the opaque transaction context.
 * In a Prisma implementation, this resolves to Prisma.TransactionClient.
 * Abstracted to prevent ORM leakage into the Domain.
 */
export interface ITransactionContext {
  [key: string]: any;
}

/**
 * Foundation for the Unit of Work.
 * Executes a callback within a managed transaction context.
 */
export interface ITransactionManager {
  execute<T>(
    operation: (context: ITransactionContext) => Promise<T>,
  ): Promise<T>;
}
