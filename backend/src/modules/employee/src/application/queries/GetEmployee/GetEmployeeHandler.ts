import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetEmployeeQuery } from './GetEmployeeQuery';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { EmployeeResponseDto } from '../../dto/responses/EmployeeResponseDto';

@QueryHandler(GetEmployeeQuery)
@Injectable()
export class GetEmployeeHandler implements IQueryHandler<GetEmployeeQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEmployeeQuery): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { id: query.employeeId, companyId: query.companyId, isDeleted: false },
      include: {
        profile: {
          select: { firstName: true, lastName: true, personalEmail: true, phone: true, profilePhoto: true }
        },
        department: { select: { id: true, name: true } },
        designation: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
        reportsTo: { 
          include: { profile: { select: { firstName: true, lastName: true } } }
        },
        fieldValues: {
          include: { fieldDefinition: true }
        }
      }
    });

    if (!employee) throw new EmployeeNotFoundException(query.employeeId);

    const dto = new EmployeeResponseDto();
    dto.id = employee.id;
    dto.businessId = employee.businessId;
    dto.companyId = employee.companyId;
    dto.profileId = employee.profileId;
    dto.status = employee.status as any;
    dto.joinedDate = employee.joinedDate;
    dto.departmentId = employee.departmentId;
    dto.designationId = employee.designationId;
    dto.branchId = employee.branchId;
    dto.reportsToId = employee.reportsToId;
    dto.employeeNumber = employee.employeeNumber;
    dto.confirmationDate = employee.confirmationDate;
    dto.probationEndDate = employee.probationEndDate;
    dto.terminationDate = employee.terminationDate;
    dto.version = employee.version;
    dto.createdAt = employee.createdAt;
    dto.updatedAt = employee.updatedAt;
    dto.createdBy = employee.createdBy;
    dto.updatedBy = employee.updatedBy;
    dto.isDeleted = employee.isDeleted;

    dto.profile = employee.profile;
    dto.department = employee.department;
    dto.designation = employee.designation;
    dto.branch = employee.branch;
    
    if (employee.reportsTo) {
      dto.manager = {
        id: employee.reportsTo.id,
        employeeNumber: employee.reportsTo.employeeNumber,
        name: `${employee.reportsTo.profile.firstName} ${employee.reportsTo.profile.lastName}`
      };
    } else {
      dto.manager = null;
    }

    if (employee.fieldValues && employee.fieldValues.length > 0) {
      dto.dynamicFields = employee.fieldValues.map((fv: any) => ({
        fieldDefinitionId: fv.fieldDefinitionId,
        key: fv.fieldDefinition.machineKey,
        label: fv.fieldDefinition.displayName,
        value: fv.valueData
      }));
    } else {
      dto.dynamicFields = [];
    }

    return dto;
  }
}
