export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface ISortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface IFilterOptions {
  [key: string]: any;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IReadRepository<TEntity> {
  findById(id: string): Promise<TEntity | null>;
  findByBusinessId(businessId: string): Promise<TEntity | null>;
  findAll(filter?: IFilterOptions): Promise<TEntity[]>;
  findWhere(filter: IFilterOptions): Promise<TEntity[]>;
  findOnePaginated(
    filter?: IFilterOptions,
    pagination?: IPaginationOptions,
    sort?: ISortOptions,
  ): Promise<IPaginatedResult<TEntity>>;
  exists(filter: IFilterOptions): Promise<boolean>;
  count(filter?: IFilterOptions): Promise<number>;
}

export interface IWriteRepository<TEntity> {
  save(entity: TEntity): Promise<void>;
  saveMany(entities: TEntity[]): Promise<void>;
  delete(entity: TEntity): Promise<void>;
  softDelete(id: string, deletedBy: string): Promise<void>;
}

export interface IRepository<TEntity>
  extends IReadRepository<TEntity>, IWriteRepository<TEntity> {}
