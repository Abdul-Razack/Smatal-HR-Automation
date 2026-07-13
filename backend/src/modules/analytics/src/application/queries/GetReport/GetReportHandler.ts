import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportQuery } from './GetReportQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetReportQuery)
@Injectable()
export class GetReportHandler implements IQueryHandler<GetReportQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetReportQuery): Promise<Result<any[]>> {
    try {
      let data: any[] = [];

      switch (query.reportType) {
        case 'CANDIDATE':
          data = await this.prisma.candidate.findMany({
            where: {
              companyId: query.companyId,
              isDeleted: false,
              ...query.filters,
            },
            include: { profile: true },
          });
          break;
        case 'EMPLOYEE':
          data = await this.prisma.employee.findMany({
            where: {
              companyId: query.companyId,
              isDeleted: false,
              ...query.filters,
            },
            include: { profile: true, department: true, designation: true },
          });
          break;
        case 'WORKFLOW':
          data = await this.prisma.workflowInstance.findMany({
            where: { companyId: query.companyId, ...query.filters },
            include: { definition: true },
          });
          break;
        case 'DOCUMENT':
          data = await this.prisma.generatedDocument.findMany({
            where: { companyId: query.companyId, ...query.filters },
          });
          break;
        default:
          return Result.fail('Invalid report type');
      }

      return Result.ok(data);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
