import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IRepository } from '../../../kernel/repositories/repository.contracts';

@Injectable()
export class RepositoryFactory {
  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * Resolves a concrete repository instance dynamically.
   * Keeps Application/Domain logic independent of Prisma injections.
   */
  public get<TRepository extends IRepository<any>>(
    type: Type<TRepository>,
  ): TRepository {
    return this.moduleRef.get(type, { strict: false });
  }
}
