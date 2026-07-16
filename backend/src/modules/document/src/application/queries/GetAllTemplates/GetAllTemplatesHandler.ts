import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllTemplatesQuery } from './GetAllTemplatesQuery';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { Result } from '../../../../../../kernel/result/Result';
import { PaginatedResult } from '../../../../../../common/dto/PaginatedResult';
import { TemplateSummaryDto } from '../../../presentation/dtos/TemplateResponseDtos';
import { TemplateStatus } from '../../../domain/enums/DocumentEnums';

@QueryHandler(GetAllTemplatesQuery)
@Injectable()
export class GetAllTemplatesHandler implements IQueryHandler<GetAllTemplatesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetAllTemplatesQuery,
  ): Promise<Result<PaginatedResult<TemplateSummaryDto>>> {
    try {
      const skip = (query.page - 1) * query.pageSize;

      const whereClause: any = {
        companyId: query.companyId,
        deletedAt: null,
      };

      if (query.documentTypeId) {
        whereClause.documentTypeId = query.documentTypeId;
      }

      if (query.status) {
        whereClause.status = query.status;
      }

      if (query.search) {
        whereClause.name = { contains: query.search, mode: 'insensitive' };
      }

      const [total, records] = await this.prisma.$transaction([
        this.prisma.template.count({ where: whereClause }),
        this.prisma.template.findMany({
          where: whereClause,
          select: {
            id: true,
            businessId: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { versions: true },
            },
          },
          skip,
          take: query.pageSize,
          orderBy: { [query.sort || 'createdAt']: query.order || 'desc' },
        }),
      ]);

      const dtos: TemplateSummaryDto[] = records.map((r: any) => ({
        id: r.id,
        businessId: r.businessId,
        name: r.name,
        status: r.status as TemplateStatus,
        versionCount: r._count.versions,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      const result = new PaginatedResult<TemplateSummaryDto>(
        dtos,
        total,
        query.page,
        query.pageSize,
      );

      return Result.ok(result);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
