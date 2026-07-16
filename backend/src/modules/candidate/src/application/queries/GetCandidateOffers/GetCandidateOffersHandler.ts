import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCandidateOffersQuery } from './GetCandidateOffersQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetCandidateOffersQuery)
@Injectable()
export class GetCandidateOffersHandler implements IQueryHandler<GetCandidateOffersQuery> {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async execute(query: GetCandidateOffersQuery): Promise<Result<any[]>> {
    try {
      const offers = await this.prisma.offerLetter.findMany({
        where: {
          candidateId: query.candidateId,
          companyId: query.companyId,
          isDeleted: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      return Result.ok(offers);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
