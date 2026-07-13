import { ICommandHandler, ICommand } from '../../cqrs/cqrs.contracts';
import { Result } from '../../result/Result';

export abstract class BaseCommandHandler<
  TCommand extends ICommand,
  TResult,
> implements ICommandHandler<TCommand, Result<TResult>> {
  public async execute(command: TCommand): Promise<Result<TResult>> {
    try {
      return await this.handle(command);
    } catch (error: any) {
      // Let exceptions bubble up to the ExceptionBehavior pipeline
      throw error;
    }
  }

  protected abstract handle(command: TCommand): Promise<Result<TResult>>;
}
