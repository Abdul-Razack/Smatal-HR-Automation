import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { DocumentGenerationStatus } from '../enums/DocumentEnums';
import { DocumentSnapshotVO } from '../value-objects/DocumentSnapshotVO';
import { randomUUID } from 'crypto';

export interface GeneratedDocumentProps {
  businessId: string;
  companyId: string;
  profileId: string;
  documentTypeId: string;
  templateVersionId: string;
  workflowInstanceId?: string | null;
  workflowStageId?: string | null;
  entityType: string;
  entityId: string;
  status: DocumentGenerationStatus;
  generatedAt?: Date | null;
  generatedBy?: string | null;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  snapshots: DocumentSnapshotVO[];
  // Provenance metadata (optional, populated from relations)
  documentTypeName?: string;
  documentTypeCode?: string;
  templateName?: string;
  templateVersionNumber?: number;
  employeeName?: string;
  employeeNumber?: string;
  companyName?: string;
}

export class GeneratedDocumentAggregate extends AggregateRoot<GeneratedDocumentProps> {
  private constructor(props: GeneratedDocumentProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: GeneratedDocumentProps,
    id?: Identifier<string>,
  ): GeneratedDocumentAggregate {
    return new GeneratedDocumentAggregate(
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
  get profileId(): string {
    return this.props.profileId;
  }
  get documentTypeId(): string {
    return this.props.documentTypeId;
  }
  get templateVersionId(): string {
    return this.props.templateVersionId;
  }
  get workflowInstanceId(): string | null | undefined {
    return this.props.workflowInstanceId;
  }
  get workflowStageId(): string | null | undefined {
    return this.props.workflowStageId;
  }
  get entityType(): string {
    return this.props.entityType;
  }
  get entityId(): string {
    return this.props.entityId;
  }
  get status(): DocumentGenerationStatus {
    return this.props.status;
  }
  get generatedAt(): Date | null | undefined {
    return this.props.generatedAt;
  }
  get generatedBy(): string | null | undefined {
    return this.props.generatedBy;
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
  get snapshots(): DocumentSnapshotVO[] {
    return this.props.snapshots;
  }
  get documentTypeName(): string | undefined {
    return this.props.documentTypeName;
  }
  get documentTypeCode(): string | undefined {
    return this.props.documentTypeCode;
  }
  get templateName(): string | undefined {
    return this.props.templateName;
  }
  get templateVersionNumber(): number | undefined {
    return this.props.templateVersionNumber;
  }
  get employeeName(): string | undefined {
    return this.props.employeeName;
  }
  get employeeNumber(): string | undefined {
    return this.props.employeeNumber;
  }
  get companyName(): string | undefined {
    return this.props.companyName;
  }

  public markAsGenerated(
    performedBy: string,
    snapshots: DocumentSnapshotVO[],
  ): void {
    const validStatuses = [
      DocumentGenerationStatus.QUEUED,
      DocumentGenerationStatus.PROCESSING,
    ];
    if (!validStatuses.includes(this.props.status as any)) {
      throw new Error('Can only mark processing/queued document as generated.');
    }
    this.props.status = DocumentGenerationStatus.GENERATED as any;
    this.props.generatedAt = new Date();
    this.props.generatedBy = performedBy;
    this.props.snapshots.push(...snapshots);
  }

  public markAsProcessing(performedBy: string): void {
    if (this.props.status !== DocumentGenerationStatus.QUEUED as any) {
      throw new Error('Can only process queued documents.');
    }
    this.props.status = DocumentGenerationStatus.PROCESSING as any;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }

  public fail(performedBy: string): void {
    this.props.status = DocumentGenerationStatus.FAILED as any;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }

  public archive(performedBy: string): void {
    if (this.props.status !== DocumentGenerationStatus.GENERATED as any) {
      throw new Error(`Cannot archive document in status ${this.props.status}`);
    }
    this.props.status = DocumentGenerationStatus.ARCHIVED as any;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }
}
