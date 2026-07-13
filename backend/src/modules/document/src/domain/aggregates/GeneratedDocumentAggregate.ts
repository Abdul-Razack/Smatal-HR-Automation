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
  candidateId?: string | null;
  employeeId?: string | null;
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
  get candidateId(): string | null | undefined {
    return this.props.candidateId;
  }
  get employeeId(): string | null | undefined {
    return this.props.employeeId;
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

  public markAsGenerated(
    performedBy: string,
    snapshot: DocumentSnapshotVO,
  ): void {
    const validStatuses = [
      DocumentGenerationStatus.GENERATING,
      DocumentGenerationStatus.PENDING,
      DocumentGenerationStatus.DRAFT,
    ];
    if (!validStatuses.includes(this.props.status)) {
      throw new Error('Can only mark generating document as generated.');
    }
    this.props.status = DocumentGenerationStatus.GENERATED;
    this.props.generatedAt = new Date();
    this.props.generatedBy = performedBy;
    this.props.snapshots.push(snapshot);
  }

  public fail(performedBy: string): void {
    this.props.status = DocumentGenerationStatus.FAILED;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }

  public voidDocument(performedBy: string): void {
    const validStatuses = [
      DocumentGenerationStatus.GENERATED,
      DocumentGenerationStatus.REVIEWED,
      DocumentGenerationStatus.SENT,
    ];
    if (!validStatuses.includes(this.props.status)) {
      throw new Error(`Cannot void document in status ${this.props.status}`);
    }
    this.props.status = DocumentGenerationStatus.VOIDED;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
  }
}
