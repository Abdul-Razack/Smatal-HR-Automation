import { GeneratedDocumentAggregate } from '../../domain/aggregates/GeneratedDocumentAggregate';
import {
  GeneratedDocumentDto,
  GeneratedDocumentSummaryDto,
  DocumentSnapshotDto,
} from '../dtos/DocumentResponseDtos';
import { DocumentSnapshotVO } from '../../domain/value-objects/DocumentSnapshotVO';

export class GeneratedDocumentDtoMapper {
  static toSummaryDto(
    domain: GeneratedDocumentAggregate,
  ): GeneratedDocumentSummaryDto {
    return {
      id: domain.id.toValue() as string,
      businessId: domain.businessId,
      profileId: domain.profileId,
      status: domain.status,
      snapshotCount: domain.snapshots.length,
      createdAt: domain.createdAt,
    };
  }

  static toDetailDto(domain: GeneratedDocumentAggregate): GeneratedDocumentDto {
    return {
      id: domain.id.toValue() as string,
      businessId: domain.businessId,
      profileId: domain.profileId,
      documentTypeId: domain.documentTypeId,
      status: domain.status,
      workflowInstanceId: domain.workflowInstanceId ?? undefined,
      workflowStageId: domain.workflowStageId ?? undefined,
      entityType: domain.entityType,
      entityId: domain.entityId,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      snapshots: domain.snapshots.map((s: DocumentSnapshotVO) =>
        this.toSnapshotDto(s),
      ),
    };
  }

  static toSnapshotDto(snapshot: DocumentSnapshotVO): DocumentSnapshotDto {
    return {
      fileUrl: snapshot.fileUrl || '',
      mimeType: snapshot.mimeType,
      fileSize: snapshot.fileSize ?? undefined,
      checksum: snapshot.checksum,
      createdAt: snapshot.createdAt,
    };
  }
}
