import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetTemplatePlaceholdersQuery } from './GetTemplatePlaceholdersQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';

export interface PlaceholderDTO {
  id: string | undefined;
  placeholderKey: string;
  fieldDefinitionId: string;
  isRequired: boolean;
  displayOrder: number;
}

export interface GetTemplatePlaceholdersResponse {
  versionId: string;
  contentType: string;
  importStatus: string | null | undefined;
  placeholderCount: number | null | undefined;
  placeholders: PlaceholderDTO[];
}

@QueryHandler(GetTemplatePlaceholdersQuery)
@Injectable()
export class GetTemplatePlaceholdersHandler implements IQueryHandler<GetTemplatePlaceholdersQuery> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepo: ITemplateRepository,
  ) {}

  async execute(
    query: GetTemplatePlaceholdersQuery,
  ): Promise<Result<GetTemplatePlaceholdersResponse>> {
    try {
      const template = await this.templateRepo.findById(query.templateId);

      if (!template) {
        return Result.fail<GetTemplatePlaceholdersResponse>(
          `Template not found: ${query.templateId}`,
        );
      }

      if (template.companyId !== query.companyId) {
        return Result.fail<GetTemplatePlaceholdersResponse>(
          `Unauthorized to access template ${query.templateId}`,
        );
      }

      const version = template.versions.find(
        (v) => v.id.toValue() === query.versionId,
      );

      if (!version) {
        return Result.fail<GetTemplatePlaceholdersResponse>(
          `TemplateVersion not found: ${query.versionId}`,
        );
      }

      const placeholders: PlaceholderDTO[] = version.placeholders.map((p) => ({
        id: p.id,
        placeholderKey: p.placeholderKey,
        fieldDefinitionId: p.fieldDefinitionId || '',
        isRequired: p.isRequired,
        displayOrder: p.displayOrder,
      }));

      return Result.ok<GetTemplatePlaceholdersResponse>({
        versionId: version.id.toValue() as string,
        contentType: version.contentType,
        importStatus: version.importStatus,
        placeholderCount: version.placeholderCount,
        placeholders,
      });
    } catch (error: any) {
      return Result.fail<GetTemplatePlaceholdersResponse>(error.message);
    }
  }
}
