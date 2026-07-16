import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

export class GetLeaveDashboardMetricsQuery implements IQuery {
  constructor(public readonly companyId: string) {}
}

@QueryHandler(GetLeaveDashboardMetricsQuery)
@Injectable()
export class GetLeaveDashboardMetricsHandler implements IQueryHandler<GetLeaveDashboardMetricsQuery> {
  private readonly logger = new Logger(GetLeaveDashboardMetricsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeaveDashboardMetricsQuery): Promise<Result<any>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        cancelledRequests,
        employeesOnLeaveToday,
        upcomingHolidays,
      ] = await Promise.all([
        this.prisma.leaveRequest.count({
          where: { companyId: query.companyId, isDeleted: false },
        }),
        this.prisma.leaveRequest.count({
          where: {
            companyId: query.companyId,
            status: 'PENDING',
            isDeleted: false,
          },
        }),
        this.prisma.leaveRequest.count({
          where: {
            companyId: query.companyId,
            status: 'APPROVED',
            isDeleted: false,
          },
        }),
        this.prisma.leaveRequest.count({
          where: {
            companyId: query.companyId,
            status: 'REJECTED',
            isDeleted: false,
          },
        }),
        this.prisma.leaveRequest.count({
          where: {
            companyId: query.companyId,
            status: 'CANCELLED',
            isDeleted: false,
          },
        }),
        this.prisma.leaveRequest.count({
          where: {
            companyId: query.companyId,
            status: 'APPROVED',
            isDeleted: false,
            startDate: { lte: today },
            endDate: { gte: today },
          },
        }),
        this.prisma.holiday.findMany({
          where: {
            companyId: query.companyId,
            date: { gte: today },
          },
          orderBy: { date: 'asc' },
          take: 5,
        }),
      ]);

      const metrics = {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        cancelledRequests,
        employeesOnLeaveToday,
        upcomingHolidays,
      };

      return Result.ok(metrics);
    } catch (error: any) {
      this.logger.error(`Error computing dashboard metrics: ${error.message}`);
      return Result.fail(error.message);
    }
  }
}
