import { ValueObject } from '../../../../../kernel/domain/ValueObject';

interface DocumentSnapshotProps {
  id?: string;
  generatedDocumentId: string;
  filePath: string;
  fileUrl?: string | null;
  fileSize?: number | null;
  mimeType: string;
  checksum: string;
  storageProvider: string;
  renderedContent?: string | null; // Keep HTML for audit, if desired
  createdAt: Date;
  createdBy: string;
}

export class DocumentSnapshotVO extends ValueObject<DocumentSnapshotProps> {
  private constructor(props: DocumentSnapshotProps) {
    super(props);
  }

  public static create(props: DocumentSnapshotProps): DocumentSnapshotVO {
    return new DocumentSnapshotVO(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }
  get generatedDocumentId(): string {
    return this.props.generatedDocumentId;
  }
  get filePath(): string {
    return this.props.filePath;
  }
  get fileUrl(): string | null | undefined {
    return this.props.fileUrl;
  }
  get fileSize(): number | null | undefined {
    return this.props.fileSize;
  }
  get mimeType(): string {
    return this.props.mimeType;
  }
  get checksum(): string {
    return this.props.checksum;
  }
  get storageProvider(): string {
    return this.props.storageProvider;
  }
  get renderedContent(): string | null | undefined {
    return this.props.renderedContent;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
}
