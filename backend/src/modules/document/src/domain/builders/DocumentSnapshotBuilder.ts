import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DocumentSnapshotVO } from '../value-objects/DocumentSnapshotVO';
import { StorageUploadResult } from '../../../../../infrastructure/storage/IStorageService';

export interface SnapshotBuilderParams {
  id?: string;
  documentId: string;
  storageResult: StorageUploadResult;
  mimeType: string;
  storageProvider: string;
  performedBy: string;
  renderedContent?: string;
  filePath: string;
}

@Injectable()
export class DocumentSnapshotBuilder {
  buildSnapshot(params: SnapshotBuilderParams): DocumentSnapshotVO {
    return DocumentSnapshotVO.create({
      id: params.id || randomUUID(),
      generatedDocumentId: params.documentId,
      filePath: params.filePath,
      fileUrl: params.storageResult.uri,
      fileSize: params.storageResult.sizeBytes,
      mimeType: params.mimeType,
      checksum: params.storageResult.checksum,
      storageProvider: params.storageProvider,
      renderedContent: params.renderedContent,
      createdAt: new Date(),
      createdBy: params.performedBy,
    });
  }
}
