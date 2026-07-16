import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

export class GetLeaveChartsQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}

@QueryHandler(GetLeaveChartsQuery)
@Injectable()
export class GetLeaveChartsHandler implements IQueryHandler<GetLeaveChartsQuery> {
  private readonly logger = new Logger(GetLeaveChartsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeaveChartsQuery): Promise<Result<any>> {
    try {
      // 1. Leave Type Distribution (Pie Chart)
      const leaveTypeDistributionRaw = await this.prisma.leaveRequest.groupBy({
        by: ['leaveTypeId'],
        where: {
          companyId: query.companyId,
          isDeleted: false,
          status: 'APPROVED',
        },
        _count: { id: true },
      });

      const leaveTypes = await this.prisma.leaveType.findMany({
        where: { companyId: query.companyId },
      });

      const leaveTypeMap = new Map(leaveTypes.map((t) => [t.id, t.name]));

      const leaveTypeDistribution = leaveTypeDistributionRaw.map((r) => ({
        name: leaveTypeMap.get(r.leaveTypeId) || 'Unknown',
        value: r._count.id,
      }));

      // 2. Department Leave Comparison (Bar Chart)
      // Needs to fetch employees, then their departments
      const requestsWithEmployees = await this.prisma.leaveRequest.findMany({
        where: {
          companyId: query.companyId,
          isDeleted: false,
          status: 'APPROVED',
        },
        include: {
          employee: {
            include: { department: true },
          },
        },
      });

      const deptMap = new Map<string, number>();
      for (const req of requestsWithEmployees) {
        const deptName = req.employee?.department?.name || 'Unassigned';
        deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);
      }

      const departmentComparison = Array.from(deptMap.entries()).map(
        ([name, value]) => ({ name, value }),
      );

      // 3. Monthly Trends (Line or Bar chart)
      // Group by month of startDate
      const monthlyTrendsMap = new Map<string, number>();

      const currentYear = new Date().getFullYear();
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        monthlyTrendsMap.set(monthName, 0);
      }

      for (const req of requestsWithEmployees) {
        if (req.startDate.getFullYear() === currentYear) {
          const monthName = req.startDate.toLocaleString('default', {
            month: 'short',
          });
          if (monthlyTrendsMap.has(monthName)) {
            monthlyTrendsMap.set(
              monthName,
              monthlyTrendsMap.get(monthName)! + 1,
            );
          }
        }
      }

      const monthlyTrends = Array.from(monthlyTrendsMap.entries()).map(
        ([name, value]) => ({ name, value }),
      );

      // 4. Approval vs Rejection
      const approvalVsRejectionRaw = await this.prisma.leaveRequest.groupBy({
        by: ['status'],
        where: { companyId: query.companyId, isDeleted: false },
        _count: { id: true },
      });

      const approvalVsRejection = approvalVsRejectionRaw.map((r) => ({
        name: r.status,
        value: r._count.id,
      }));

      return Result.ok({
        leaveTypeDistribution,
        departmentComparison,
        monthlyTrends,
        approvalVsRejection,
      });
    } catch (error: any) {
      this.logger.error(`Error computing charts data: ${error.message}`);
      return Result.fail(error.message);
    }
  }
}
