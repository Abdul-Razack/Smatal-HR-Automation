import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import {
  TemplateVersionStatus,
  TemplateImportStatus,
} from '../enums/DocumentEnums';
import { TemplatePlaceholderVO } from '../value-objects/TemplatePlaceholderVO';
import { randomUUID } from 'crypto';

export interface TemplateVersionProps {
  businessId: string;
  templateId: string;
  versionNumber: number;
  content: string;
  contentType: string;
  status: TemplateVersionStatus;
  publishedAt?: Date | null;
  publishedBy?: string | null;
  notes?: string | null;
  placeholders: TemplatePlaceholderVO[];
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;

  // V2: DOCX Import optional fields — all nullable for backward compatibility
  storageUri?: string | null;
  originalFilename?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  checksum?: string | null;
  placeholderCount?: number | null;
  importStatus?: TemplateImportStatus | null;
}

export class TemplateVersionEntity extends Entity<TemplateVersionProps> {
  private constructor(props: TemplateVersionProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: TemplateVersionProps,
    id?: Identifier<string>,
  ): TemplateVersionEntity {
    return new TemplateVersionEntity(
      props,
      id ?? new Identifier<string>(randomUUID()),
    );
  }

  // ── Existing getters ──────────────────────────────────────────────────────
  get businessId(): string {
    return this.props.businessId;
  }
  get templateId(): string {
    return this.props.templateId;
  }
  get versionNumber(): number {
    return this.props.versionNumber;
  }
  get content(): string {
    return this.props.content;
  }
  get contentType(): string {
    return this.props.contentType;
  }
  get status(): TemplateVersionStatus {
    return this.props.status;
  }
  get publishedAt(): Date | null | undefined {
    return this.props.publishedAt;
  }
  get publishedBy(): string | null | undefined {
    return this.props.publishedBy;
  }
  get notes(): string | null | undefined {
    return this.props.notes;
  }
  get placeholders(): TemplatePlaceholderVO[] {
    return this.props.placeholders;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }
  get version(): number {
    return this.props.version;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }

  // ── V2 DOCX Import getters ────────────────────────────────────────────────
  get storageUri(): string | null | undefined {
    return this.props.storageUri;
  }
  get originalFilename(): string | null | undefined {
    return this.props.originalFilename;
  }
  get mimeType(): string | null | undefined {
    return this.props.mimeType;
  }
  get fileSize(): number | null | undefined {
    return this.props.fileSize;
  }
  get checksum(): string | null | undefined {
    return this.props.checksum;
  }
  get placeholderCount(): number | null | undefined {
    return this.props.placeholderCount;
  }
  get importStatus(): TemplateImportStatus | null | undefined {
    return this.props.importStatus;
  }

  // ── Domain behaviour (unchanged) ──────────────────────────────────────────
  public publish(performedBy: string): void {
    if (this.props.status !== TemplateVersionStatus.DRAFT) {
      throw new Error(
        `Cannot publish version from status ${this.props.status}`,
      );
    }
    this.props.status = TemplateVersionStatus.PUBLISHED;
    this.props.publishedAt = new Date();
    this.props.publishedBy = performedBy;
  }

  public archive(_performedBy: string): void {
    if (this.props.status === TemplateVersionStatus.DRAFT) {
      this.props.isDeleted = true;
    } else {
      this.props.status = TemplateVersionStatus.ARCHIVED;
    }
  }

  public deprecate(_performedBy: string): void {
    if (this.props.status !== TemplateVersionStatus.PUBLISHED) {
      throw new Error('Only published versions can be deprecated.');
    }
    this.props.status = TemplateVersionStatus.DEPRECATED;
  }

  public rollback(_performedBy: string): void {
    if (this.props.status !== TemplateVersionStatus.PUBLISHED) {
      throw new Error('Only published versions can be rolled back.');
    }
    this.props.status = TemplateVersionStatus.ROLLED_BACK;
  }

  /** V2: Update the import lifecycle status (called by Import/Mapping handlers) */
  public updateImportStatus(
    status: TemplateImportStatus,
    count?: number,
  ): void {
    this.props.importStatus = status;
    if (count !== undefined) {
      this.props.placeholderCount = count;
    }
  }
}
