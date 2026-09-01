import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetReportQuery } from './GetReportQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetReportQuery)
@Injectable()
export class GetReportHandler implements IQueryHandler<GetReportQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetReportQuery): Promise<Result<any>> {
    try {
      let data: any[] = [];
      let headers: string[] = [];
      let rows: any[][] = [];

      switch (query.reportType.toUpperCase()) {
        case 'CANDIDATE':
        case 'ATS_PIPELINE':
          data = await this.prisma.candidate.findMany({
            where: {
              companyId: query.companyId,
              isDeleted: false,
              ...query.filters,
            },
            include: { profile: true },
          });
          headers = ['ID', 'Name', 'Email', 'Status', 'Applied Date'];
          rows = data.map((c) => [
            c.candidateNumber || c.id,
            `${c.profile?.firstName || ''} ${c.profile?.lastName || ''}`.trim(),
            c.profile?.email || '',
            c.status,
            c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '',
          ]);
          break;
        case 'ATS_INTERVIEW':
          data = [];
          headers = ['Interview ID', 'Candidate', 'Title', 'Type', 'Status', 'Scheduled At'];
          rows = [];
          break;
        case 'ATS_OFFER':
          data = [];
          headers = ['Offer ID', 'Candidate', 'Status', 'Base Salary', 'Currency', 'Joining Date'];
          rows = [];
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
          headers = [
            'Emp ID',
            'Name',
            'Department',
            'Designation',
            'Status',
            'Joined Date',
          ];
          rows = data.map((e) => [
            e.employeeNumber || e.id,
            `${e.profile?.firstName || ''} ${e.profile?.lastName || ''}`.trim(),
            e.department?.name || '',
            e.designation?.title || '',
            e.status,
            e.joinedDate ? new Date(e.joinedDate).toLocaleDateString() : '',
          ]);
          break;
        case 'WORKFLOW':
          data = await this.prisma.workflowInstance.findMany({
            where: { companyId: query.companyId, ...query.filters },
            include: { workflowDefinition: true },
          });
          headers = ['ID', 'Workflow', 'Status', 'Current Stage', 'Started At'];
          rows = data.map((w) => [
            w.id,
            w.workflowDefinition?.name || '',
            w.status,
            w.currentStageId || '',
            w.startedAt ? new Date(w.startedAt).toLocaleDateString() : '',
          ]);
          break;
        case 'DOCUMENT':
          data = await this.prisma.generatedDocument.findMany({
            where: { companyId: query.companyId, ...query.filters },
          });
          headers = ['Doc ID', 'Template Version', 'Status', 'Generated At'];
          rows = data.map((d) => [
            d.businessId || d.id,
            d.templateVersionId,
            d.status,
            d.generatedAt ? new Date(d.generatedAt).toLocaleDateString() : '',
          ]);
          break;
        case 'ORGANIZATION': {
          const depts = await this.prisma.department.findMany({
            where: { companyId: query.companyId, isDeleted: false },
            include: { parent: true },
          });
          headers = ['Department', 'Code', 'Parent Department', 'Created At'];
          rows = depts.map((d) => [
            d.name,
            d.code,
            d.parent?.name || 'None',
            d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '',
          ]);
          data = depts;
          break;
        }
        case 'HEADCOUNT': {
          data = await this.prisma.employee.findMany({
            where: { companyId: query.companyId, isDeleted: false, ...query.filters },
            include: { department: true },
          });
          headers = ['Department', 'Employee Name', 'Status', 'Joined Date'];
          rows = data.map((e) => [
            e.department?.name || 'Unassigned',
            `${e.profile?.firstName || ''} ${e.profile?.lastName || ''}`.trim(),
            e.status,
            e.joinedDate ? new Date(e.joinedDate).toLocaleDateString() : '',
          ]);
          break;
        }
        default:
          return Result.fail('Invalid report type: ' + query.reportType);
      }

      return Result.ok({
        headers,
        rows,
        totalCount: data.length,
      });
    } catch (error: any) {
      console.error('GetReportHandler ERROR:', error);
      return Result.fail(error.message);
    }
  }
}
