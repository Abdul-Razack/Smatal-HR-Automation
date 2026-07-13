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
      }

      return Result.fail('Invalid dashboard type');
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }

  private async getHRStats(companyId: string) {
    const totalCandidates = await this.prisma.candidate.count({
      where: { companyId, isDeleted: false },
    });
    const activeCandidates = await this.prisma.candidate.count({
      where: { companyId, isDeleted: false, candidateStatus: 'ACTIVE' },
    });
    const convertedCandidates = await this.prisma.candidate.count({
      where: { companyId, isDeleted: false, candidateStatus: 'CONVERTED' },
    });
    const activeEmployees = await this.prisma.employee.count({
      where: { companyId, isDeleted: false, isActive: true },
    });

    // We can join with workflow to get workflow counts
    const runningWorkflows = await this.prisma.workflowInstance.count({
      where: { companyId, status: 'RUNNING' },
    });
    const completedWorkflows = await this.prisma.workflowInstance.count({
      where: { companyId, status: 'COMPLETED' },
    });

    const recentHires = await this.prisma.employee.findMany({
      where: { companyId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { profile: true },
    });

    return {
      totalCandidates,
      activeCandidates,
      convertedCandidates,
      activeEmployees,
      runningWorkflows,
      completedWorkflows,
      recentHires: recentHires.map((h: any) => ({
        id: h.id,
        businessId: h.businessId,
        name: `${h.profile.firstName} ${h.profile.lastName}`,
        joinedAt: h.createdAt,
      })),
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

    // We can do similar for Designations and Branches
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
