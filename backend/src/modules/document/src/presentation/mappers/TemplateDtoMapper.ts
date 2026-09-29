import { TemplateAggregate } from '../../domain/aggregates/TemplateAggregate';
import {
  TemplateDto,
  TemplateSummaryDto,
  TemplateVersionDto,
  PlaceholderDto,
} from '../dtos/TemplateResponseDtos';
import { TemplateVersionEntity } from '../../domain/entities/TemplateVersionEntity';

export class TemplateDtoMapper {
  static toSummaryDto(domain: TemplateAggregate): TemplateSummaryDto {
    return {
      id: domain.id.toValue() as string,
      businessId: domain.businessId,
      name: domain.name,
      status: domain.status,
      versionCount: domain.versions.length,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  static toDetailDto(domain: TemplateAggregate): TemplateDto {
    return {
      id: domain.id.toValue() as string,
      businessId: domain.businessId,
      documentTypeId: domain.documentTypeId,
      name: domain.name,
      description: domain.description ?? undefined,
      status: domain.status,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      versions: domain.versions.map((v: TemplateVersionEntity) =>
        this.toVersionDto(v),
      ),
    };
  }

  static toVersionDto(version: TemplateVersionEntity): TemplateVersionDto {
    return {
      id: version.id.toValue() as string,
      versionNumber: version.versionNumber,
      status: version.status,
      contentType: version.contentType,
      content: version.content,
      notes: version.notes ?? undefined,
      importStatus: version.importStatus ?? undefined,
      originalFilename: version.originalFilename ?? undefined,
      placeholders: version.placeholders?.map((p: any) => ({
        placeholderKey: p.placeholderKey,
        fieldDefinitionId: p.fieldDefinitionId,
        isRequired: p.isRequired,
      })),
      createdAt: version.createdAt,
    };
  }
}
