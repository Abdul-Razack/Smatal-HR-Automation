import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';

export class GetLeaveReportsQuery implements IQuery {
  constructor(
    public readonly companyId: string,
    public readonly reportType: string,
    public readonly filters: any,
    public readonly page: number,
    public readonly limit: number,
  ) {}
}

@QueryHandler(GetLeaveReportsQuery)
@Injectable()
export class GetLeaveReportsHandler implements IQueryHandler<GetLeaveReportsQuery> {
  private readonly logger = new Logger(GetLeaveReportsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeaveReportsQuery): Promise<Result<any>> {
    try {
      const { companyId, reportType, filters, page, limit } = query;
      const skip = (page - 1) * limit;

      let data: any[] = [];
      let totalCount = 0;
      let headers: string[] = [];
      let rows: any[][] = [];

      switch (reportType.toUpperCase()) {
        case 'ALL':
        case 'MONTHLY':
        case 'DEPARTMENT':
        case 'EMPLOYEE': {
          const whereClause: Prisma.LeaveRequestWhereInput = {
            companyId,
            isDeleted: false,
          };

          if (filters.status) whereClause.status = filters.status;
          if (filters.leaveTypeId)
            whereClause.leaveTypeId = filters.leaveTypeId;

          if (filters.employeeId) {
            whereClause.employeeId = filters.employeeId;
          }

          if (filters.departmentId) {
            whereClause.employee = { departmentId: filters.departmentId };
          }

          if (filters.startDate && filters.endDate) {
            whereClause.startDate = { gte: new Date(filters.startDate) };
            whereClause.endDate = { lte: new Date(filters.endDate) };
          }

          const [records, count] = await Promise.all([
            this.prisma.leaveRequest.findMany({
              where: whereClause,
              skip,
              take: limit,
              include: {
                employee: { include: { profile: true, department: true } },
                leaveType: true,
              },
              orderBy: { createdAt: 'desc' },
            }),
            this.prisma.leaveRequest.count({ where: whereClause }),
          ]);

          data = records;
          totalCount = count;
          headers = [
            'Employee Name',
            'Department',
            'Leave Type',
            'Start Date',
            'End Date',
            'Days',
            'Status',
          ];
          rows = data.map((r) => [
            `${r.employee?.profile?.firstName || ''} ${r.employee?.profile?.lastName || ''}`.trim(),
            r.employee?.department?.name || 'N/A',
            r.leaveType?.name || 'N/A',
            r.startDate.toLocaleDateString(),
            r.endDate.toLocaleDateString(),
            r.durationDays,
            r.status,
          ]);
          break;
        }
        case 'BALANCE': {
          const whereClause: Prisma.LeaveBalanceWhereInput = {
            companyId,
          };
          if (filters.employeeId) whereClause.employeeId = filters.employeeId;
          if (filters.year) whereClause.year = parseInt(filters.year);

          const [records, count] = await Promise.all([
            this.prisma.leaveBalance.findMany({
              where: whereClause,
              skip,
              take: limit,
              include: {
                employee: { include: { profile: true, department: true } },
                leaveType: true,
              },
            }),
            this.prisma.leaveBalance.count({ where: whereClause }),
          ]);

          data = records;
          totalCount = count;
          headers = [
            'Employee Name',
            'Leave Type',
            'Year',
            'Total Granted',
            'Used',
            'Remaining',
          ];
          rows = data.map((b) => [
            `${b.employee?.profile?.firstName || ''} ${b.employee?.profile?.lastName || ''}`.trim(),
            b.leaveType?.name || 'N/A',
            b.year,
            b.totalGranted,
            b.usedDays,
            b.remainingDays,
          ]);
          break;
        }
        default:
          return Result.fail(`Unsupported report type: ${reportType}`);
      }

      return Result.ok({
        headers,
        rows,
        totalCount,
        page,
        limit,
      });
    } catch (error: any) {
      this.logger.error(`Error generating report: ${error.message}`);
      return Result.fail(error.message);
    }
  }
}
