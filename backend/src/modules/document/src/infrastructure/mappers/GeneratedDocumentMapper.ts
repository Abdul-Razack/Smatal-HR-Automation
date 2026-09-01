import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { GeneratedDocumentAggregate } from '../../domain/aggregates/GeneratedDocumentAggregate';
import { DocumentSnapshotVO } from '../../domain/value-objects/DocumentSnapshotVO';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { DocumentGenerationStatus } from '../../domain/enums/DocumentEnums';

export class GeneratedDocumentMapper implements Mapper<
  GeneratedDocumentAggregate,
  any,
  any
> {
  toDomain(row: any): GeneratedDocumentAggregate {
    const snapshots = (row.snapshots || []).map((s: any) =>
      DocumentSnapshotVO.create({
        id: s.id,
        generatedDocumentId: s.generatedDocumentId,
        filePath: s.filePath,
        fileUrl: s.fileUrl,
        fileSize: s.fileSize,
        mimeType: s.mimeType,
        checksum: s.checksum,
        storageProvider: s.storageProvider,
        renderedContent: s.renderedContent,
        createdAt: s.createdAt,
        createdBy: s.createdBy,
      }),
    );

    return GeneratedDocumentAggregate.create(
      {
        businessId: row.businessId,
        companyId: row.companyId,
        profileId: row.profileId,
        documentTypeId: row.documentTypeId,
        templateVersionId: row.templateVersionId,
        workflowInstanceId: row.workflowInstanceId,
        workflowStageId: row.workflowStageId,
        entityType: row.entityType,
        entityId: row.entityId,
        status: row.status as DocumentGenerationStatus,
        generatedAt: row.generatedAt,
        generatedBy: row.generatedBy,
        isDeleted: row.isDeleted,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
        snapshots,
      },
      new Identifier<string>(row.id),
    );
  }

  toPersistence(domain: GeneratedDocumentAggregate): any {
    return {
      id: domain.id.toValue(),
      businessId: domain.businessId,
      companyId: domain.companyId,
      profileId: domain.profileId,
      documentTypeId: domain.documentTypeId,
      templateVersionId: domain.templateVersionId,
      workflowInstanceId: domain.workflowInstanceId,
      workflowStageId: domain.workflowStageId,
      entityType: domain.entityType,
      entityId: domain.entityId,
      status: domain.status,
      generatedAt: domain.generatedAt,
      generatedBy: domain.generatedBy,
      isDeleted: domain.isDeleted,
      version: domain.version,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      createdBy: domain.createdBy,
      updatedBy: domain.updatedBy,
      snapshots: domain.snapshots.map((s) => ({
        id: s.id,
        generatedDocumentId: s.generatedDocumentId,
        filePath: s.filePath,
        fileUrl: s.fileUrl,
        fileSize: s.fileSize,
        mimeType: s.mimeType,
        checksum: s.checksum,
        storageProvider: s.storageProvider,
        renderedContent: s.renderedContent,
        createdAt: s.createdAt,
        createdBy: s.createdBy,
      })),
    };
  }

  toDTO(domain: GeneratedDocumentAggregate): any {
    return {
      id: domain.id.toValue(),
      businessId: domain.businessId,
      status: domain.status,
      documentTypeId: domain.documentTypeId,
      templateVersionId: domain.templateVersionId,
      profileId: domain.profileId,
      generatedAt: domain.generatedAt,
      snapshots: domain.snapshots.map((s) => ({
        id: s.id,
        fileUrl: s.fileUrl,
        createdAt: s.createdAt,
      })),
    };
  }
}
