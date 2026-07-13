export interface ICommand {}

export interface ICommandHandler<TCommand extends ICommand, TResult = any> {
  execute(command: TCommand): Promise<TResult>;
}

export interface IQuery {}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  execute(query: TQuery): Promise<TResult>;
}

export interface IEvent {}

export interface IEventHandler<TEvent extends IEvent> {
  handle(event: TEvent): Promise<void>;
}
