import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { IQuery } from '../../cqrs/cqrs.contracts';

@Injectable()
export class QueryDispatcher {
  constructor(private readonly queryBus: QueryBus) {}

  public async dispatch<TQuery extends IQuery, TResult>(
    query: TQuery,
  ): Promise<TResult> {
    return this.queryBus.execute(query);
  }
}
