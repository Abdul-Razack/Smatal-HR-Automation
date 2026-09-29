import { Injectable, Optional, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetResignationQuery } from './GetResignationQuery';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { ResignationStatus } from '../../../domain/enums/ResignationEnums';

export interface ResignationResponseDto {
  status: ResignationStatus;
  resignationDate?: Date | string | null;
  lastWorkingDate?: Date | string | null;
  noticePeriodDays?: number | null;
  reason?: string | null;
  acceptedBy?: string | null;
  acceptedAt?: Date | string | null;
  comments?: string | null;
  history: Array<{
    id: string;
    resignationDate: Date | string;
    lastWorkingDate: Date | string;
    noticePeriodDays: number;
    reason: string;
    status: ResignationStatus;
    acceptedBy?: string | null;
    acceptedAt?: Date | string | null;
    comments?: string | null;
    createdAt: Date | string;
  }>;
}

@QueryHandler(GetResignationQuery)
@Injectable()
export class GetResignationHandler implements IQueryHandler<GetResignationQuery> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    private readonly employeeDomainService: EmployeeDomainService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async execute(query: GetResignationQuery): Promise<ResignationResponseDto> {
    const employee = await this.employeeRepository.findById(query.employeeId);
    if (!employee) {
      throw new EmployeeNotFoundException(query.employeeId);
    }

    this.employeeDomainService.assertNotDeleted(employee);
    this.employeeDomainService.assertBelongsToCompany(employee, query.companyId);

    let resignations: any[] = [];
    if (this.prisma) {
      try {
        resignations = await (this.prisma as any).resignation.findMany({
          where: {
            employeeId: employee.id.toString(),
            companyId: query.companyId,
            isDeleted: false,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (e: any) {
        // Mock fallback
      }
    }

    const latest = resignations[0];

    const currentStatus =
      employee.resignationStatus ??
      (latest?.status as ResignationStatus) ??
      ResignationStatus.NOT_SUBMITTED;

    return {
      status: currentStatus,
      resignationDate: employee.resignationDate ?? latest?.resignationDate ?? null,
      lastWorkingDate: employee.lastWorkingDate ?? latest?.lastWorkingDate ?? null,
      noticePeriodDays: employee.noticePeriodDays ?? latest?.noticePeriodDays ?? null,
      reason: employee.resignationReason ?? latest?.reason ?? null,
      acceptedBy: latest?.acceptedBy ?? null,
      acceptedAt: latest?.acceptedAt ?? null,
      comments: latest?.comments ?? null,
      history: resignations.map((r: any) => ({
        id: r.id,
        resignationDate: r.resignationDate,
        lastWorkingDate: r.lastWorkingDate,
        noticePeriodDays: r.noticePeriodDays,
        reason: r.reason,
        status: r.status,
        acceptedBy: r.acceptedBy,
        acceptedAt: r.acceptedAt,
        comments: r.comments,
        createdAt: r.createdAt,
      })),
    };
  }
}
