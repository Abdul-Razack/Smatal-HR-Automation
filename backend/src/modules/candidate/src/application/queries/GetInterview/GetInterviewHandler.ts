import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInterviewQuery } from './GetInterviewQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetInterviewQuery)
@Injectable()
export class GetInterviewHandler implements IQueryHandler<GetInterviewQuery> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetInterviewQuery): Promise<Result<any>> {
    try {
      const interview = await this.prisma.interviewSchedule.findUnique({
        where: {
          id: query.interviewId,
          companyId: query.companyId,
          isDeleted: false,
        },
        include: {
          interviewers: {
            include: {
              employee: {
                include: { profile: true },
              },
            },
          },
          feedback: {
            include: {
              interviewer: {
                include: { profile: true },
              },
            },
          },
        },
      });

      if (!interview) {
        throw new Error('Interview not found');
      }

      return Result.ok(interview);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
