import { InterviewAggregate } from '../../domain/aggregates/InterviewAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';
type PrismaInterview = any;
type PrismaFeedback = any;
type PrismaInterviewer = any;
import { InterviewStatus } from '../../domain/enums/InterviewStatus';
import { InterviewType } from '../../domain/enums/InterviewType';
import { InterviewFeedbackEntity } from '../../domain/entities/InterviewFeedbackEntity';

type PrismaInterviewWithRelations = PrismaInterview & {
  feedback?: PrismaFeedback | null;
  interviewers?: PrismaInterviewer[];
};

export class InterviewMapper {
  static toDomain(raw: PrismaInterviewWithRelations): InterviewAggregate {
    let feedbackEntity = null;
    if (raw.feedback && !raw.feedback.isDeleted) {
      feedbackEntity = InterviewFeedbackEntity.reconstitute(
        {
          companyId: raw.feedback.companyId,
          interviewerId: raw.feedback.interviewerId,
          rating: raw.feedback.rating,
          comments: raw.feedback.comments,
          recommendation: raw.feedback.recommendation,
          isDeleted: raw.feedback.isDeleted,
          version: raw.feedback.version,
          createdAt: raw.feedback.createdAt,
          updatedAt: raw.feedback.updatedAt,
          createdBy: raw.feedback.createdBy,
          updatedBy: raw.feedback.updatedBy,
        },
        new Identifier(raw.feedback.id),
      );
    }

    const interviewerIds = raw.interviewers ? raw.interviewers.map((i: any) => i.employeeId) : [];

    return InterviewAggregate.reconstitute(
      {
        businessId: raw.businessId,
        companyId: new Identifier(raw.companyId),
        candidateId: raw.candidateId,
        title: raw.title,
        description: raw.description,
        type: raw.type as InterviewType,
        status: raw.status as InterviewStatus,
        scheduledAt: raw.scheduledAt,
        durationMinutes: raw.durationMinutes,
        meetingLink: raw.meetingLink,
        location: raw.location,
        interviewerIds,
        feedback: feedbackEntity,
        isDeleted: raw.isDeleted,
        deletedAt: raw.deletedAt,
        deletedBy: raw.deletedBy,
        version: raw.version,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        createdBy: raw.createdBy,
        updatedBy: raw.updatedBy,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(interview: InterviewAggregate): PrismaInterviewWithRelations {
    return {
      id: interview.id.toString(),
      businessId: interview.businessId,
      companyId: interview.companyId.toString(),
      candidateId: interview.candidateId,
      title: interview.title,
      description: interview.description ?? null,
      type: interview.type as any,
      status: interview.status as any,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      meetingLink: interview.meetingLink ?? null,
      location: interview.location ?? null,
      isDeleted: interview.isDeleted,
      deletedAt: interview.deletedAt ?? null,
      deletedBy: interview.deletedBy ?? null,
      version: interview.version,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      createdBy: interview.createdBy,
      updatedBy: interview.updatedBy,
      
      interviewers: interview.interviewerIds.map((eid) => ({
        interviewScheduleId: interview.id.toString(),
        employeeId: eid,
        createdAt: new Date(),
      })),

      feedback: interview.feedback
        ? {
            id: interview.feedback.id.toString(),
            businessId: `${interview.businessId}-FB`,
            interviewScheduleId: interview.id.toString(),
            companyId: interview.feedback.companyId,
            interviewerId: interview.feedback.interviewerId,
            rating: interview.feedback.rating,
            comments: interview.feedback.comments,
            recommendation: interview.feedback.recommendation,
            isDeleted: interview.feedback.isDeleted,
            deletedAt: null,
            deletedBy: null,
            version: interview.feedback.version,
            createdAt: interview.feedback.createdAt,
            updatedAt: interview.feedback.updatedAt,
            createdBy: interview.feedback.createdBy,
            updatedBy: interview.feedback.updatedBy,
          }
        : null,
    };
  }
}
