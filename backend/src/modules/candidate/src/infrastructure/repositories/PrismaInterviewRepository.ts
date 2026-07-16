import { Injectable, Inject } from '@nestjs/common';
import { IInterviewRepository } from '../../domain/repositories/IInterviewRepository';
import { InterviewAggregate } from '../../domain/aggregates/InterviewAggregate';
import { InterviewMapper } from '../mappers/InterviewMapper';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@Injectable()
export class PrismaInterviewRepository implements IInterviewRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  private get client() {
    return this.prisma;
  }

  async findById(id: string): Promise<InterviewAggregate | null> {
    const raw = await this.client.interviewSchedule.findUnique({
      where: { id, isDeleted: false },
      include: {
        feedback: true,
        interviewers: true,
      },
    });
    if (!raw) return null;
    return InterviewMapper.toDomain(raw);
  }

  async findByCandidateId(candidateId: string): Promise<InterviewAggregate[]> {
    const raws = await this.client.interviewSchedule.findMany({
      where: { candidateId, isDeleted: false },
      include: {
        feedback: true,
        interviewers: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
    return raws.map(InterviewMapper.toDomain);
  }

  async save(interview: InterviewAggregate): Promise<void> {
    const data = InterviewMapper.toPersistence(interview);

    // Prisma's upsert for deep nested relations is tricky, so we use a transaction inside the main transaction
    const existing = await this.client.interviewSchedule.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      await this.client.interviewSchedule.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          scheduledAt: data.scheduledAt,
          durationMinutes: data.durationMinutes,
          meetingLink: data.meetingLink,
          location: data.location,
          isDeleted: data.isDeleted,
          deletedAt: data.deletedAt,
          deletedBy: data.deletedBy,
          version: data.version,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy,
        },
      });

      // Update interviewers
      await this.client.interviewInterviewer.deleteMany({
        where: { interviewScheduleId: data.id },
      });
      if (data.interviewers && data.interviewers.length > 0) {
        await this.client.interviewInterviewer.createMany({
          data: data.interviewers,
        });
      }

      // Update feedback
      if (data.feedback) {
        await this.client.interviewFeedback.upsert({
          where: { interviewScheduleId: data.id },
          update: {
            rating: data.feedback.rating,
            comments: data.feedback.comments,
            recommendation: data.feedback.recommendation,
            isDeleted: data.feedback.isDeleted,
            updatedBy: data.feedback.updatedBy,
            version: data.feedback.version,
          },
          create: data.feedback,
        });
      } else {
        await this.client.interviewFeedback.deleteMany({
          where: { interviewScheduleId: data.id },
        });
      }
    } else {
      // Create new
      await this.client.interviewSchedule.create({
        data: {
          id: data.id,
          businessId: data.businessId,
          companyId: data.companyId,
          candidateId: data.candidateId,
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          scheduledAt: data.scheduledAt,
          durationMinutes: data.durationMinutes,
          meetingLink: data.meetingLink,
          location: data.location,
          isDeleted: data.isDeleted,
          version: data.version,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
          interviewers: {
            create: data.interviewers,
          },
          feedback: data.feedback
            ? {
                create: data.feedback,
              }
            : undefined,
        },
      });
    }
  }

  async delete(id: string): Promise<void> {
    await this.client.interviewSchedule.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
