import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GlobalSearchQuery } from './GlobalSearchQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GlobalSearchQuery)
@Injectable()
export class GlobalSearchHandler implements IQueryHandler<GlobalSearchQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GlobalSearchQuery): Promise<Result<any[]>> {
    try {
      const results: any[] = [];
      const searchTerms = `%${query.keyword}%`;

      // Search Profiles (Candidates & Employees)
      const profiles = await this.prisma.profile.findMany({
        where: {
          companyId: query.companyId,
          OR: [
            { firstName: { contains: query.keyword, mode: 'insensitive' } },
            { lastName: { contains: query.keyword, mode: 'insensitive' } },
            { email: { contains: query.keyword, mode: 'insensitive' } },
          ],
        },
        take: query.limit,
      });

      for (const p of profiles) {
        results.push({
          type: 'PROFILE',
          id: p.id,
          businessId: p.businessId,
          title: `${p.firstName} ${p.lastName}`,
          subtitle: p.email,
        });
      }

      // Search Workflows
      const workflows = await this.prisma.workflowDefinition.findMany({
        where: {
          companyId: query.companyId,
          name: { contains: query.keyword, mode: 'insensitive' },
        },
        take: query.limit,
      });

      for (const w of workflows) {
        results.push({
          type: 'WORKFLOW',
          id: w.id,
          businessId: w.businessId,
          title: w.name,
          subtitle: w.processCode,
        });
      }

      // Search Documents
      const docs = await this.prisma.generatedDocument.findMany({
        where: {
          companyId: query.companyId,
          businessId: { contains: query.keyword, mode: 'insensitive' },
        },
        take: query.limit,
      });

      for (const d of docs) {
        results.push({
          type: 'DOCUMENT',
          id: d.id,
          businessId: d.businessId,
          title: `Document ${d.businessId}`,
          subtitle: `Status: ${d.status}`,
        });
      }

      return Result.ok(results.slice(0, query.limit));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
