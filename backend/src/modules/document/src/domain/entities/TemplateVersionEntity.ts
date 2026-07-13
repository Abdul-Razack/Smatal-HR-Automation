import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TemplateVersionStatus } from '../enums/DocumentEnums';
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

  public rollback(_performedBy: string): void {
    if (this.props.status !== TemplateVersionStatus.PUBLISHED) {
      throw new Error('Only published versions can be rolled back.');
    }
    this.props.status = TemplateVersionStatus.ROLLED_BACK;
  }
}
