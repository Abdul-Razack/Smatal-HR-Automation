import { AggregateRoot } from '../../../../../kernel/domain/AggregateRoot';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { InterviewStatus, INTERVIEW_STATUS_TRANSITIONS } from '../enums/InterviewStatus';
import { InterviewType } from '../enums/InterviewType';
import { InterviewFeedbackEntity } from '../entities/InterviewFeedbackEntity';
import {
  InterviewScheduledEvent,
  InterviewCancelledEvent,
  InterviewCompletedEvent,
} from '../events/CandidateEvents';

export interface InterviewProps extends TenantIsolatedEntityProps {
  candidateId: string;
  title: string;
  description?: string | null;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: Date;
  durationMinutes: number;
  meetingLink?: string | null;
  location?: string | null;
  interviewerIds: string[];
  feedback?: InterviewFeedbackEntity | null;
}

export class InterviewAggregate extends AggregateRoot<InterviewProps> {
  private constructor(props: InterviewProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(props: InterviewProps, id: Identifier<string>, performedBy: string): InterviewAggregate {
    const interview = new InterviewAggregate(props, id);
    interview.addDomainEvent(
      new InterviewScheduledEvent(
        id.toString(),
        props.candidateId,
        props.companyId.toString(),
        props.title,
        props.scheduledAt,
        performedBy,
      ),
    );
    return interview;
  }

  static reconstitute(props: InterviewProps, id: Identifier<string>): InterviewAggregate {
    return new InterviewAggregate(props, id);
  }

  get companyId(): Identifier<string> {
    return this.props.companyId;
  }
  get candidateId(): string {
    return this.props.candidateId;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get title(): string {
    return this.props.title;
  }
  get description(): string | null | undefined {
    return this.props.description;
  }
  get type(): InterviewType {
    return this.props.type;
  }
  get status(): InterviewStatus {
    return this.props.status;
  }
  get scheduledAt(): Date {
    return this.props.scheduledAt;
  }
  get durationMinutes(): number {
    return this.props.durationMinutes;
  }
  get meetingLink(): string | null | undefined {
    return this.props.meetingLink;
  }
  get location(): string | null | undefined {
    return this.props.location;
  }
  get interviewerIds(): string[] {
    return this.props.interviewerIds;
  }
  get feedback(): InterviewFeedbackEntity | null | undefined {
    return this.props.feedback;
  }
  get version(): number {
    return this.props.version;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
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
  get deletedAt(): Date | null | undefined {
    return this.props.deletedAt;
  }
  get deletedBy(): string | null | undefined {
    return this.props.deletedBy;
  }

  update(
    title: string,
    description: string | null | undefined,
    type: InterviewType,
    scheduledAt: Date,
    durationMinutes: number,
    meetingLink: string | null | undefined,
    location: string | null | undefined,
    interviewerIds: string[],
    performedBy: string,
  ): void {
    if (this.props.isDeleted) throw new Error('Cannot update deleted interview');
    this.props.title = title;
    this.props.description = description;
    this.props.type = type;
    this.props.scheduledAt = scheduledAt;
    this.props.durationMinutes = durationMinutes;
    this.props.meetingLink = meetingLink;
    this.props.location = location;
    this.props.interviewerIds = interviewerIds;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  transitionStatus(newStatus: InterviewStatus, performedBy: string): void {
    if (this.props.isDeleted) throw new Error('Cannot update deleted interview');
    const allowed = INTERVIEW_STATUS_TRANSITIONS[this.props.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from ${this.props.status} to ${newStatus}`);
    }
    this.props.status = newStatus;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  submitFeedback(feedback: InterviewFeedbackEntity, performedBy: string): void {
    if (this.props.isDeleted) throw new Error('Cannot submit feedback for deleted interview');
    if (this.props.status !== InterviewStatus.COMPLETED) {
      throw new Error('Cannot submit feedback before interview is completed');
    }
    this.props.feedback = feedback;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addDomainEvent(
      new InterviewCompletedEvent(
        this.id.toString(),
        this.props.candidateId,
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  cancel(performedBy: string): void {
    this.transitionStatus(InterviewStatus.CANCELLED, performedBy);
    this.addDomainEvent(
      new InterviewCancelledEvent(
        this.id.toString(),
        this.props.candidateId,
        this.props.companyId.toString(),
        performedBy,
      ),
    );
  }

  softDelete(performedBy: string): void {
    this.props.isDeleted = true;
    this.props.deletedAt = new Date();
    this.props.deletedBy = performedBy;
    this.props.updatedBy = performedBy;
    this.props.updatedAt = new Date();
    this.props.version++;
  }
}
