import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ICommand } from '../../cqrs/cqrs.contracts';

@Injectable()
export class CommandDispatcher {
  constructor(private readonly commandBus: CommandBus) {}

  public async dispatch<TCommand extends ICommand, TResult>(
    command: TCommand,
  ): Promise<TResult> {
    return this.commandBus.execute(command);
  }
}
