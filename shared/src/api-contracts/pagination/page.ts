export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface PageRequest {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export class PageResult<T> {
  constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly page: number,
    public readonly size: number,
  ) {}

  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }
}
