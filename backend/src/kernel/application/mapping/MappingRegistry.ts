import { Injectable } from '@nestjs/common';
import { Mapper } from '../../mapping/mapping.contracts';

@Injectable()
export class MappingRegistry {
  private mappers = new Map<string, Mapper<any, any, any>>();

  public register<Domain, DTO, Persistence>(
    name: string,
    mapper: Mapper<Domain, DTO, Persistence>,
  ): void {
    this.mappers.set(name, mapper);
  }

  public get<Domain, DTO, Persistence>(
    name: string,
  ): Mapper<Domain, DTO, Persistence> {
    const mapper = this.mappers.get(name);
    if (!mapper) {
      throw new Error(`Mapper ${name} not found in registry`);
    }
    return mapper;
  }
}
