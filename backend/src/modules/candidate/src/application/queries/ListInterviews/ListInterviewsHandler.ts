import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListInterviewsQuery } from './ListInterviewsQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(ListInterviewsQuery)
@Injectable()
export class ListInterviewsHandler implements IQueryHandler<ListInterviewsQuery> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: ListInterviewsQuery): Promise<Result<any[]>> {
    try {
      const interviews = await (this.prisma as any).interviewSchedule.findMany({
        where: {
          candidateId: query.candidateId,
          companyId: query.companyId,
          isDeleted: false,
        },
        include: {
          interviewers: true,
          feedback: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });

      return Result.ok(interviews);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
