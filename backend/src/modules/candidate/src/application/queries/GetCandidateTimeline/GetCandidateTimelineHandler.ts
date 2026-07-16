import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCandidateTimelineQuery } from './GetCandidateTimelineQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetCandidateTimelineQuery)
@Injectable()
export class GetCandidateTimelineHandler implements IQueryHandler<GetCandidateTimelineQuery> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetCandidateTimelineQuery): Promise<Result<any[]>> {
    try {
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: query.candidateId, companyId: query.companyId, isDeleted: false },
        include: {
          profile: true,
        },
      });

      if (!candidate) throw new Error('Candidate not found');

      const interviews = await this.prisma.interviewSchedule.findMany({
        where: { candidateId: query.candidateId, isDeleted: false },
      });

      const offers = await this.prisma.offerLetter.findMany({
        where: { candidateId: query.candidateId, isDeleted: false },
      });

      const timeline: any[] = [];

      // Application
      timeline.push({
        id: `APP-${candidate.id}`,
        type: 'APPLICATION_RECEIVED',
        title: 'Application Received',
        description: `Candidate applied via ${candidate.source || 'Direct'}`,
        timestamp: candidate.appliedDate || candidate.createdAt,
        metadata: { status: candidate.status },
      });

      // Interviews
      for (const inv of interviews) {
        timeline.push({
          id: `INV-${inv.id}`,
          type: 'INTERVIEW_SCHEDULED',
          title: `Interview: ${inv.title}`,
          description: `${inv.type} interview (${inv.status})`,
          timestamp: inv.createdAt, // Or scheduledAt if preferred, but for audit trail createdAt is when it happened
          metadata: { scheduledAt: inv.scheduledAt, status: inv.status },
        });
      }

      // Offers
      for (const off of offers) {
        timeline.push({
          id: `OFF-${off.id}`,
          type: 'OFFER_EXTENDED',
          title: 'Offer Letter',
          description: `Offer status: ${off.status}`,
          timestamp: off.createdAt,
          metadata: { status: off.status, ctc: off.baseSalary },
        });
      }

      // Sort chronological descending
      timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return Result.ok(timeline);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
