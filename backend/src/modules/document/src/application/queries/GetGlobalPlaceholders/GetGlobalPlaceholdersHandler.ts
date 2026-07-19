import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../../kernel/result/Result';
import { GetGlobalPlaceholdersQuery } from './GetGlobalPlaceholdersQuery';
import { PlaceholderRegistryService } from '../../../domain/services/PlaceholderRegistryService';
import { PlaceholderMetadata } from '../../../domain/models/PlaceholderMetadata';
import { Logger } from '@nestjs/common';

@QueryHandler(GetGlobalPlaceholdersQuery)
export class GetGlobalPlaceholdersHandler
  implements IQueryHandler<GetGlobalPlaceholdersQuery>
{
  private readonly logger = new Logger(GetGlobalPlaceholdersHandler.name);

  constructor(private readonly registryService: PlaceholderRegistryService) {}

  async execute(
    query: GetGlobalPlaceholdersQuery,
  ): Promise<Result<PlaceholderMetadata[]>> {
    try {
      const placeholders = await this.registryService.getPlaceholders(
        query.companyId,
        query.search,
        query.entityFilter,
      );

      return Result.ok<PlaceholderMetadata[]>(placeholders);
    } catch (error: any) {
      this.logger.error(
        `Failed to get global placeholders: ${error.message}`,
        error.stack,
      );
      return Result.fail<PlaceholderMetadata[]>(error.message);
    }
  }
}
