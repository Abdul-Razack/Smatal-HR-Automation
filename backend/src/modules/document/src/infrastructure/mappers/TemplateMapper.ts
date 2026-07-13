import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { TemplateAggregate } from '../../domain/aggregates/TemplateAggregate';
import { TemplateVersionEntity } from '../../domain/entities/TemplateVersionEntity';
import { TemplatePlaceholderVO } from '../../domain/value-objects/TemplatePlaceholderVO';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import {
  TemplateStatus,
  TemplateVersionStatus,
} from '../../domain/enums/DocumentEnums';

export class TemplateMapper implements Mapper<TemplateAggregate, any, any> {
  toDomain(row: any): TemplateAggregate {
    const versions = (row.versions || []).map((v: any) => {
      const placeholders = (v.placeholders || []).map((p: any) =>
        TemplatePlaceholderVO.create({
          id: p.id,
          fieldDefinitionId: p.fieldDefinitionId,
          placeholderKey: p.placeholderKey,
          isRequired: p.isRequired,
          displayOrder: p.displayOrder,
        }),
      );

      return TemplateVersionEntity.create(
        {
          businessId: v.businessId,
          templateId: v.templateId,
          versionNumber: v.versionNumber,
          content: v.content,
          contentType: v.contentType,
          status: v.status as TemplateVersionStatus,
          publishedAt: v.publishedAt,
          publishedBy: v.publishedBy,
          notes: v.notes,
          placeholders,
          isDeleted: v.isDeleted,
          version: v.version,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
          createdBy: v.createdBy,
          updatedBy: v.updatedBy,
        },
        new Identifier<string>(v.id),
      );
    });

    return TemplateAggregate.create(
      {
        businessId: row.businessId,
        companyId: row.companyId,
        documentTypeId: row.documentTypeId,
        name: row.name,
        description: row.description,
        status: row.status as TemplateStatus,
        isDeleted: row.isDeleted,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        versions,
      },
      new Identifier<string>(row.id),
    );
  }

  toPersistence(domain: TemplateAggregate): any {
    return {
      id: domain.id.toValue(),
      businessId: domain.businessId,
      companyId: domain.companyId,
      documentTypeId: domain.documentTypeId,
      name: domain.name,
      description: domain.description,
      status: domain.status,
      isDeleted: domain.isDeleted,
      version: domain.version,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      createdBy: domain.createdBy,
      updatedBy: domain.updatedBy,
      versions: domain.versions.map((v) => ({
        id: v.id.toValue(),
        businessId: v.businessId,
        templateId: v.templateId,
        versionNumber: v.versionNumber,
        content: v.content,
        contentType: v.contentType,
        status: v.status,
        publishedAt: v.publishedAt,
        publishedBy: v.publishedBy,
        notes: v.notes,
        isDeleted: v.isDeleted,
        version: v.version,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
        createdBy: v.createdBy,
        updatedBy: v.updatedBy,
        placeholders: v.placeholders.map((p) => ({
          id: p.id,
          fieldDefinitionId: p.fieldDefinitionId,
          placeholderKey: p.placeholderKey,
          isRequired: p.isRequired,
          displayOrder: p.displayOrder,
        })),
      })),
    };
  }

  toDTO(domain: TemplateAggregate): any {
    return {
      id: domain.id.toValue(),
      businessId: domain.businessId,
      name: domain.name,
      documentTypeId: domain.documentTypeId,
      status: domain.status,
      createdAt: domain.createdAt,
      versions: domain.versions.map((v) => ({
        id: v.id.toValue(),
        versionNumber: v.versionNumber,
        status: v.status,
        publishedAt: v.publishedAt,
      })),
    };
  }
}
