import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TemplateStatus, TemplateVersionStatus } from '../enums/DocumentEnums';
import { TemplateVersionEntity } from '../entities/TemplateVersionEntity';
import { randomUUID } from 'crypto';

export interface TemplateProps {
  businessId: string;
  companyId: string;
  documentTypeId: string;
  name: string;
  description?: string | null;
  status: TemplateStatus;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  versions: TemplateVersionEntity[];
}

export class TemplateAggregate extends AggregateRoot<TemplateProps> {
  private constructor(props: TemplateProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: TemplateProps,
    id?: Identifier<string>,
  ): TemplateAggregate {
    return new TemplateAggregate(
      props,
      id ?? new Identifier<string>(randomUUID()),
    );
  }

  get businessId(): string {
    return this.props.businessId;
  }
  get companyId(): string {
    return this.props.companyId;
  }
  get documentTypeId(): string {
    return this.props.documentTypeId;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get status(): TemplateStatus {
    return this.props.status;
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
  get versions(): TemplateVersionEntity[] {
    return this.props.versions;
  }

  public addVersion(version: TemplateVersionEntity): void {
    const existing = this.props.versions.find(
      (v) => v.versionNumber === version.versionNumber,
    );
    if (existing) {
      throw new Error(
        `Version ${version.versionNumber} already exists for template ${this.id.toValue()}`,
      );
    }
    this.props.versions.push(version);
  }

  public publishVersion(versionId: string, performedBy: string): void {
    const versionToPublish = this.props.versions.find(
      (v) => v.id.toValue() === versionId,
    );
    if (!versionToPublish) {
      throw new Error(
        `Version ${versionId} not found in template ${this.id.toValue()}`,
      );
    }
    // Deprecate any currently active version
    const activeVersion = this.props.versions.find(
      (v) => v.status === TemplateVersionStatus.PUBLISHED,
    );
    if (activeVersion && activeVersion.id.toValue() !== versionId) {
      activeVersion.deprecate(performedBy);
    }
    versionToPublish.publish(performedBy);
    this.props.status = TemplateStatus.PUBLISHED;
  }

  public getActiveVersion(): TemplateVersionEntity | undefined {
    return this.props.versions.find(
      (v) => v.status === TemplateVersionStatus.PUBLISHED,
    );
  }

  public archive(performedBy: string): void {
    this.props.status = TemplateStatus.ARCHIVED;
    this.props.versions.forEach((v) => v.archive(performedBy));
  }
}
