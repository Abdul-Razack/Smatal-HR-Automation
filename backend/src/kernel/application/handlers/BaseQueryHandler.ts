import { IQueryHandler, IQuery } from '../../cqrs/cqrs.contracts';
import { Result } from '../../result/Result';

export abstract class BaseQueryHandler<
  TQuery extends IQuery,
  TResult,
> implements IQueryHandler<TQuery, Result<TResult>> {
  public async execute(query: TQuery): Promise<Result<TResult>> {
    try {
      return await this.handle(query);
    } catch (error: any) {
      throw error;
    }
  }

  protected abstract handle(query: TQuery): Promise<Result<TResult>>;
}
