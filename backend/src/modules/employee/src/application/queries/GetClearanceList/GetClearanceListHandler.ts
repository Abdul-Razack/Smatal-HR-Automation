import { Injectable, Optional, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetClearanceListQuery } from './GetClearanceListQuery';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { ClearanceDepartment, ClearanceStatus } from '../../../domain/enums/ResignationEnums';

export interface ClearanceItemDto {
  department: ClearanceDepartment;
  status: ClearanceStatus;
  remarks?: string | null;
  clearedBy?: string | null;
  clearedAt?: Date | string | null;
}

export interface ClearanceListResponseDto {
  employeeId: string;
  isAllCleared: boolean;
  clearances: ClearanceItemDto[];
}

@QueryHandler(GetClearanceListQuery)
@Injectable()
export class GetClearanceListHandler
  implements IQueryHandler<GetClearanceListQuery>
{
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    private readonly employeeDomainService: EmployeeDomainService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async execute(query: GetClearanceListQuery): Promise<ClearanceListResponseDto> {
    const employee = await this.employeeRepository.findById(query.employeeId);
    if (!employee) {
      throw new EmployeeNotFoundException(query.employeeId);
    }

    this.employeeDomainService.assertNotDeleted(employee);
    this.employeeDomainService.assertBelongsToCompany(employee, query.companyId);

    const requiredDepts = [
      ClearanceDepartment.HR,
      ClearanceDepartment.FINANCE,
      ClearanceDepartment.IT,
      ClearanceDepartment.ADMINISTRATION,
    ];

    let recordedClearances: any[] = [];
    if (this.prisma) {
      try {
        recordedClearances = await (this.prisma as any).exitClearance.findMany({
          where: {
            employeeId: employee.id.toString(),
            companyId: query.companyId,
          },
        });
      } catch (e: any) {
        // Mock fallback
      }
    }

    const clearances: ClearanceItemDto[] = requiredDepts.map((dept) => {
      const match = recordedClearances.find((c: any) => c.department === dept);
      if (match) {
        return {
          department: match.department,
          status: match.status,
          remarks: match.remarks ?? null,
          clearedBy: match.clearedBy ?? null,
          clearedAt: match.clearedAt ?? null,
        };
      }
      return {
        department: dept,
        status: ClearanceStatus.PENDING,
        remarks: null,
        clearedBy: null,
        clearedAt: null,
      };
    });

    const isAllCleared = clearances.every(
      (c) =>
        c.status === ClearanceStatus.CLEARED ||
        c.status === ClearanceStatus.NOT_APPLICABLE,
    );

    return {
      employeeId: employee.id.toString(),
      isAllCleared,
      clearances,
    };
  }
}
