import { Injectable, Optional } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetExitOverviewQuery } from './GetExitOverviewQuery';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { EmployeeStatus } from '../../../domain/enums/EmployeeStatus';
import { ClearanceStatus, ResignationStatus } from '../../../domain/enums/ResignationEnums';

export interface ExitPipelineItemDto {
  id: string;
  businessId: string;
  fullName: string;
  departmentName?: string | null;
  designationName?: string | null;
  status: EmployeeStatus;
  resignationStatus?: ResignationStatus | null;
  resignationDate?: Date | string | null;
  lastWorkingDate?: Date | string | null;
  noticePeriodDays?: number | null;
  clearanceProgress: {
    clearedCount: number;
    totalCount: number;
    isAllCleared: boolean;
  };
}

export interface ExitOverviewResponseDto {
  pendingResignationsCount: number;
  activeNoticePeriodsCount: number;
  completedExitsCount: number;
  pipeline: ExitPipelineItemDto[];
}

@QueryHandler(GetExitOverviewQuery)
@Injectable()
export class GetExitOverviewHandler implements IQueryHandler<GetExitOverviewQuery> {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async execute(query: GetExitOverviewQuery): Promise<ExitOverviewResponseDto> {
    if (!this.prisma) {
      return {
        pendingResignationsCount: 0,
        activeNoticePeriodsCount: 0,
        completedExitsCount: 0,
        pipeline: [],
      };
    }

    try {
      const employees = await (this.prisma as any).employee.findMany({
        where: {
          companyId: query.companyId,
          isDeleted: false,
          OR: [
            { status: EmployeeStatus.NOTICE_PERIOD },
            { status: EmployeeStatus.NOTICE },
            { status: EmployeeStatus.RELIEVED },
            { resignationStatus: { in: [ResignationStatus.SUBMITTED, ResignationStatus.ACCEPTED] } },
          ],
        },
        include: {
          profile: { select: { firstName: true, lastName: true } },
          department: { select: { name: true } },
          designation: { select: { name: true } },
          clearances: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      let pendingResignationsCount = 0;
      let activeNoticePeriodsCount = 0;
      let completedExitsCount = 0;

      const pipeline: ExitPipelineItemDto[] = employees.map((emp: any) => {
        const resStatus = emp.resignationStatus as ResignationStatus;
        if (resStatus === ResignationStatus.SUBMITTED) {
          pendingResignationsCount++;
        }
        if (
          emp.status === EmployeeStatus.NOTICE_PERIOD ||
          emp.status === EmployeeStatus.NOTICE
        ) {
          activeNoticePeriodsCount++;
        }
        if (
          emp.status === EmployeeStatus.RELIEVED ||
          resStatus === ResignationStatus.COMPLETED
        ) {
          completedExitsCount++;
        }

        const clearances = emp.clearances || [];
        const clearedCount = clearances.filter(
          (c: any) =>
            c.status === ClearanceStatus.CLEARED ||
            c.status === ClearanceStatus.NOT_APPLICABLE,
        ).length;
        const totalCount = 4;
        const isAllCleared = clearedCount >= totalCount;

        return {
          id: emp.id,
          businessId: emp.businessId,
          fullName: `${emp.profile?.firstName || ''} ${emp.profile?.lastName || ''}`.trim() || 'Unknown',
          departmentName: emp.department?.name ?? null,
          designationName: emp.designation?.name ?? null,
          status: emp.status,
          resignationStatus: resStatus ?? null,
          resignationDate: emp.resignationDate,
          lastWorkingDate: emp.lastWorkingDate,
          noticePeriodDays: emp.noticePeriodDays,
          clearanceProgress: {
            clearedCount,
            totalCount,
            isAllCleared,
          },
        };
      });

      return {
        pendingResignationsCount,
        activeNoticePeriodsCount,
        completedExitsCount,
        pipeline,
      };
    } catch (e: any) {
      return {
        pendingResignationsCount: 0,
        activeNoticePeriodsCount: 0,
        completedExitsCount: 0,
        pipeline: [],
      };
    }
  }
}
