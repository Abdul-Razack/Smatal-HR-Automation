import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDashboardQuery } from './GetDashboardQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetDashboardQuery)
@Injectable()
export class GetDashboardHandler implements IQueryHandler<GetDashboardQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDashboardQuery): Promise<Result<any>> {
    try {
      if (query.dashboardType === 'HR') {
        const stats = await this.getHRStats(query.companyId);
        return Result.ok(stats);
      } else if (query.dashboardType === 'ORG') {
        const stats = await this.getOrgStats(query.companyId);
        return Result.ok(stats);
      } else if (query.dashboardType === 'DOC') {
        const stats = await this.getDocStats(query.companyId);
        return Result.ok(stats);
      } else if (query.dashboardType === 'ATS') {
        return Result.fail('ATS and recruitment analytics are disabled in this minimalist HR system');
      }

      return Result.fail('Invalid dashboard type');
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  private async getHRStats(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const next30Days = new Date(todayStart.getTime() + 30 * 24 * 60 * 60 * 1000);

    // 1. Group employees by status and fetch aggregates in parallel
    const [
      totalEmployees,
      statusGroups,
      pendingResignations,
      runningWorkflows,
      completedWorkflows,
      generatedDocuments,
    ] = await Promise.all([
      this.prisma.employee.count({
        where: { companyId, isDeleted: false },
      }),
      this.prisma.employee.groupBy({
        by: ['status'],
        where: { companyId, isDeleted: false },
        _count: { id: true },
      }),
      this.prisma.resignation.count({
        where: { companyId, status: 'SUBMITTED', isDeleted: false },
      }),
      this.prisma.workflowInstance.count({
        where: { companyId, status: 'IN_PROGRESS' },
      }),
      this.prisma.workflowInstance.count({
        where: { companyId, status: 'COMPLETED' },
      }),
      this.prisma.generatedDocument.count({
        where: { companyId },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const group of statusGroups) {
      statusCounts[group.status] = group._count.id;
    }

    const offerEmployees = statusCounts['OFFER'] || 0;
    const joinedEmployees = statusCounts['JOINED'] || 0;
    const probationEmployees = statusCounts['PROBATION'] || 0;
    const confirmedEmployees = statusCounts['CONFIRMED'] || 0;
    const noticePeriodEmployees =
      (statusCounts['NOTICE_PERIOD'] || 0) + (statusCounts['NOTICE'] || 0);
    const relievedEmployees =
      (statusCounts['RELIEVED'] || 0) +
      (statusCounts['TERMINATED'] || 0) +
      (statusCounts['RESIGNED'] || 0) +
      (statusCounts['RETIRED'] || 0);

    // Active employees are currently employed (joined, probation, confirmed, notice period, active/onboarding)
    const activeEmployees =
      joinedEmployees +
      probationEmployees +
      confirmedEmployees +
      noticePeriodEmployees +
      (statusCounts['ACTIVE'] || 0) +
      (statusCounts['ONBOARDING'] || 0);

    const lifecycleBreakdown = {
      OFFER: offerEmployees,
      JOINED: joinedEmployees,
      PROBATION: probationEmployees,
      CONFIRMED: confirmedEmployees,
      NOTICE_PERIOD: noticePeriodEmployees,
      RELIEVED: relievedEmployees,
    };

    // 2. Fetch specific list sections in parallel (limited sets)
    const [newJoinersRaw, upcomingConfirmationsRaw, noticePeriodRaw, recentRelievedRaw] =
      await Promise.all([
        // New Joiners This Month
        this.prisma.employee.findMany({
          where: {
            companyId,
            isDeleted: false,
            joinedDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          orderBy: { joinedDate: 'desc' },
          take: 10,
          include: {
            profile: { select: { firstName: true, lastName: true } },
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        }),
        // Upcoming Confirmations (next 30 days)
        this.prisma.employee.findMany({
          where: {
            companyId,
            isDeleted: false,
            status: 'PROBATION',
            OR: [
              {
                confirmationDate: {
                  gte: todayStart,
                  lte: next30Days,
                },
              },
              {
                probationEndDate: {
                  gte: todayStart,
                  lte: next30Days,
                },
              },
            ],
          },
          orderBy: [{ confirmationDate: 'asc' }, { probationEndDate: 'asc' }],
          take: 10,
          include: {
            profile: { select: { firstName: true, lastName: true } },
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        }),
        // Employees in Notice Period
        this.prisma.employee.findMany({
          where: {
            companyId,
            isDeleted: false,
            status: { in: ['NOTICE_PERIOD', 'NOTICE'] },
          },
          orderBy: { lastWorkingDate: 'asc' },
          take: 10,
          include: {
            profile: { select: { firstName: true, lastName: true } },
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        }),
        // Recently Relieved Employees
        this.prisma.employee.findMany({
          where: {
            companyId,
            isDeleted: false,
            status: { in: ['RELIEVED', 'TERMINATED', 'RESIGNED', 'RETIRED'] },
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            profile: { select: { firstName: true, lastName: true } },
            department: { select: { name: true } },
            designation: { select: { name: true } },
          },
        }),
      ]);

    const newJoinersThisMonth = newJoinersRaw.map((e: any) => ({
      id: e.id,
      employeeId: e.businessId || e.employeeNumber || e.id,
      name: `${e.profile?.firstName || ''} ${e.profile?.lastName || ''}`.trim() || 'Unnamed Employee',
      department: e.department?.name || 'Unassigned',
      designation: e.designation?.name || 'Unassigned',
      joiningDate: e.joinedDate,
    }));

    const upcomingConfirmations = upcomingConfirmationsRaw.map((e: any) => ({
      id: e.id,
      employeeId: e.businessId || e.employeeNumber || e.id,
      name: `${e.profile?.firstName || ''} ${e.profile?.lastName || ''}`.trim() || 'Unnamed Employee',
      department: e.department?.name || 'Unassigned',
      designation: e.designation?.name || 'Unassigned',
      confirmationDate: e.confirmationDate || e.probationEndDate,
    }));

    const noticePeriodList = noticePeriodRaw.map((e: any) => ({
      id: e.id,
      employeeId: e.businessId || e.employeeNumber || e.id,
      name: `${e.profile?.firstName || ''} ${e.profile?.lastName || ''}`.trim() || 'Unnamed Employee',
      department: e.department?.name || 'Unassigned',
      designation: e.designation?.name || 'Unassigned',
      lastWorkingDate: e.lastWorkingDate,
    }));

    const recentRelieved = recentRelievedRaw.map((e: any) => ({
      id: e.id,
      employeeId: e.businessId || e.employeeNumber || e.id,
      name: `${e.profile?.firstName || ''} ${e.profile?.lastName || ''}`.trim() || 'Unnamed Employee',
      department: e.department?.name || 'Unassigned',
      designation: e.designation?.name || 'Unassigned',
      relievedDate: e.lastWorkingDate || e.terminationDate || e.updatedAt,
    }));

    // Backwards-compatible recentHires for any existing code
    const recentHires = newJoinersThisMonth.slice(0, 5).map((h) => ({
      id: h.id,
      businessId: h.employeeId,
      name: h.name,
      joinedAt: h.joiningDate,
    }));

    return {
      totalEmployees,
      activeEmployees,
      probationEmployees,
      confirmedEmployees,
      noticePeriodEmployees,
      relievedEmployees,
      lifecycleBreakdown,
      newJoinersThisMonth,
      upcomingConfirmations,
      noticePeriodList,
      pendingResignations,
      recentRelieved,
      runningWorkflows,
      completedWorkflows,
      generatedDocuments,
      recentHires,
    };
  }

  private async getOrgStats(companyId: string) {
    // Employees by Department
    const deptStats = await this.prisma.employee.groupBy({
      by: ['departmentId'],
      where: { companyId, isDeleted: false, departmentId: { not: null } },
      _count: { id: true },
    });

    const deptMap = await this.prisma.department.findMany({
      where: { companyId },
    });

    const byDepartment = deptStats.map((stat: any) => {
      const dept = deptMap.find((d: any) => d.id === stat.departmentId);
      return { department: dept?.name || 'Unknown', count: stat._count.id };
    });

    return {
      employeesByDepartment: byDepartment,
    };
  }

  private async getDocStats(companyId: string) {
    const docTypes = await this.prisma.generatedDocument.groupBy({
      by: ['documentTypeId'],
      where: { companyId },
      _count: { id: true },
    });

    return {
      documentsByType: docTypes,
    };
  }
}
