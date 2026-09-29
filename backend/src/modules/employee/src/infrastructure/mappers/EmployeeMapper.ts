import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { EmployeeAggregate } from '../../domain/aggregates/EmployeeAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { EmployeeStatus } from '../../domain/enums/EmployeeStatus';
import { EmployeeResponseDto } from '../../application/dto/responses/EmployeeResponseDto';

export interface PrismaEmployeeRow {
  id: string;
  businessId: string;
  profileId: string;
  companyId: string;
  branchId: string | null;
  departmentId: string | null;
  designationId: string | null;
  reportsToId: string | null;
  employeeNumber: string | null;
  employmentType: string | null;
  salary: any;
  status: string;
  joinedDate: Date;
  confirmationDate: Date | null;
  probationEndDate: Date | null;
  resignationDate: Date | null;
  lastWorkingDate: Date | null;
  noticePeriodDays: number | null;
  terminationDate: Date | null;
  resignationReason?: string | null;
  resignationStatus?: any;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

@Injectable()
export class EmployeeMapper implements Mapper<
  EmployeeAggregate,
  EmployeeResponseDto,
  PrismaEmployeeRow
> {
  toDomain(row: PrismaEmployeeRow): EmployeeAggregate {
    return EmployeeAggregate.reconstitute(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        profileId: row.profileId,
        status: row.status as EmployeeStatus,
        joinedDate: row.joinedDate,
        departmentId: row.departmentId,
        designationId: row.designationId,
        branchId: row.branchId,
        reportsToId: row.reportsToId,
        employeeNumber: row.employeeNumber,
        employmentType: row.employmentType,
        salary: row.salary ? Number(row.salary) : null,
        confirmationDate: row.confirmationDate,
        probationEndDate: row.probationEndDate,
        resignationDate: row.resignationDate,
        lastWorkingDate: row.lastWorkingDate,
        noticePeriodDays: row.noticePeriodDays,
        terminationDate: row.terminationDate,
        resignationReason: row.resignationReason ?? null,
        resignationStatus: row.resignationStatus ?? null,
        isDeleted: row.isDeleted,
        deletedAt: row.deletedAt,
        deletedBy: row.deletedBy,
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
      },
      new Identifier<string>(row.id),
    );
  }

  toDTO(entity: EmployeeAggregate): EmployeeResponseDto {
    return this.toResponseDto(entity);
  }

  toResponseDto(entity: EmployeeAggregate): EmployeeResponseDto {
    const dto = new EmployeeResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.profileId = entity.profileId;
    dto.status = entity.status;
    dto.joinedDate = entity.joinedDate;
    dto.departmentId = entity.departmentId;
    dto.designationId = entity.designationId;
    dto.branchId = entity.branchId;
    dto.reportsToId = entity.reportsToId;
    dto.employeeNumber = entity.employeeNumber;
    dto.employmentType = entity.employmentType;
    dto.salary = entity.salary;
    dto.confirmationDate = entity.confirmationDate;
    dto.probationEndDate = entity.probationEndDate;
    dto.resignationDate = entity.resignationDate;
    dto.lastWorkingDate = entity.lastWorkingDate;
    dto.noticePeriodDays = entity.noticePeriodDays;
    dto.resignationReason = entity.resignationReason;
    dto.resignationStatus = entity.resignationStatus;
    dto.terminationDate = entity.terminationDate;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toPersistence(entity: EmployeeAggregate): PrismaEmployeeRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      profileId: entity.profileId,
      status: entity.status,
      joinedDate: entity.joinedDate,
      departmentId: entity.departmentId ?? null,
      designationId: entity.designationId ?? null,
      branchId: entity.branchId ?? null,
      reportsToId: entity.reportsToId ?? null,
      employeeNumber: entity.employeeNumber ?? null,
      employmentType: entity.employmentType ?? null,
      salary: entity.salary ?? null,
      confirmationDate: entity.confirmationDate ?? null,
      probationEndDate: entity.probationEndDate ?? null,
      resignationDate: entity.resignationDate ?? null,
      lastWorkingDate: entity.lastWorkingDate ?? null,
      noticePeriodDays: entity.noticePeriodDays ?? null,
      terminationDate: entity.terminationDate ?? null,
      resignationReason: entity.resignationReason ?? null,
      resignationStatus: (entity.resignationStatus as any) ?? null,
      isDeleted: entity.isDeleted,
      deletedAt: entity.deletedAt ?? null,
      deletedBy: entity.deletedBy ?? null,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
