import { Entity } from '../../../../../kernel/domain/Entity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface InterviewFeedbackProps {
  companyId: string;
  interviewerId: string;
  rating: number;
  comments: string;
  recommendation: string;
  isDeleted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export class InterviewFeedbackEntity extends Entity<InterviewFeedbackProps> {
  private constructor(props: InterviewFeedbackProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(props: InterviewFeedbackProps, id: Identifier<string>): InterviewFeedbackEntity {
    return new InterviewFeedbackEntity(props, id);
  }

  static reconstitute(props: InterviewFeedbackProps, id: Identifier<string>): InterviewFeedbackEntity {
    return new InterviewFeedbackEntity(props, id);
  }

  get companyId(): string {
    return this.props.companyId;
  }
  get interviewerId(): string {
    return this.props.interviewerId;
  }
  get rating(): number {
    return this.props.rating;
  }
  get comments(): string {
    return this.props.comments;
  }
  get recommendation(): string {
    return this.props.recommendation;
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
}
