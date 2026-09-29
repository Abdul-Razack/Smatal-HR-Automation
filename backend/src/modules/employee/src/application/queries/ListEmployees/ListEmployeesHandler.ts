import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListEmployeesQuery } from './ListEmployeesQuery';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { IPaginatedResult } from '../../../../../../kernel/repositories/repository.contracts';
import { EmployeeResponseDto } from '../../dto/responses/EmployeeResponseDto';

@QueryHandler(ListEmployeesQuery)
@Injectable()
export class ListEmployeesHandler implements IQueryHandler<ListEmployeesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: ListEmployeesQuery,
  ): Promise<IPaginatedResult<EmployeeResponseDto>> {
    const where: any = { companyId: query.companyId, isDeleted: false };
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.search && query.search.trim().length > 0) {
      const search = query.search.trim();
      where.OR = [
        { businessId: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        { profile: { personalEmail: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const orderBy = query.sortField
      ? { [query.sortField]: query.sortDirection }
      : { createdAt: 'desc' as const };

    const [records, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          profile: {
            select: { firstName: true, lastName: true, personalEmail: true, phone: true, profilePhoto: true, address: true, dateOfBirth: true, gender: true }
          },
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        }
      }),
      this.prisma.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = records.map((employee: any) => {
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
      dto.employmentType = employee.employmentType;
      dto.salary = employee.salary ? Number(employee.salary) : null;
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
      return dto;
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}
