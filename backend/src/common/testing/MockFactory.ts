import { IUnitOfWork } from '../../infrastructure/database/transaction/IUnitOfWork';
import { IRepository } from '../../kernel/repositories/repository.contracts';
import { CommandDispatcher } from '../../kernel/application/cqrs/CommandDispatcher';
import { QueryDispatcher } from '../../kernel/application/cqrs/QueryDispatcher';
import { EventDispatcher } from '../../kernel/application/cqrs/EventDispatcher';
import { Result } from '../../kernel/result/Result';

/**
 * Provides generic Mock stubs for critical architectural components.
 * Specifically configured for Jest.
 */
export class MockFactory {
  static createUnitOfWork(): jest.Mocked<IUnitOfWork> {
    return {
      withTransaction: jest.fn().mockImplementation(async (cb) => await cb()),
      getTransactionContext: jest.fn().mockReturnValue({}),
    };
  }

  static createRepository<T>(): jest.Mocked<IRepository<T>> {
    return {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;
  }

  static createCommandDispatcher(): jest.Mocked<CommandDispatcher> {
    return {
      dispatch: jest.fn().mockResolvedValue(Result.ok(null)),
    } as any;
  }

  static createQueryDispatcher(): jest.Mocked<QueryDispatcher> {
    return {
      dispatch: jest.fn().mockResolvedValue(Result.ok(null)),
    } as any;
  }

  static createEventDispatcher(): jest.Mocked<EventDispatcher> {
    return {
      dispatch: jest.fn().mockResolvedValue(undefined),
      dispatchAll: jest.fn().mockResolvedValue(undefined),
    } as any;
  }
}
