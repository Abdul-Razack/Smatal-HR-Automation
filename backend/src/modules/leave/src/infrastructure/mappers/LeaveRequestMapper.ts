import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { LeaveRequestAggregate } from '../../domain/aggregates/LeaveRequestAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { LeaveStatus, LeaveDurationType } from '../../domain/enums/LeaveEnums';
import { LeaveResponseDto } from '../../application/dto/responses/LeaveResponses';
import { DateRange } from '../../domain/value-objects/DateRange';
import { LeaveDuration } from '../../domain/value-objects/LeaveDuration';
import { Prisma } from '@prisma/client';

export type PrismaLeaveRequestRow = Prisma.LeaveRequestGetPayload<{}>;

@Injectable()
export class LeaveRequestMapper implements Mapper<
  LeaveRequestAggregate,
  LeaveResponseDto,
  PrismaLeaveRequestRow
> {
  toDomain(row: PrismaLeaveRequestRow): LeaveRequestAggregate {
    return LeaveRequestAggregate.reconstitute(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        employeeId: new Identifier<string>(row.employeeId),
        leaveTypeId: new Identifier<string>(row.leaveTypeId),
        status: row.status as LeaveStatus,
        dateRange: DateRange.create(row.startDate, row.endDate),
        duration: LeaveDuration.create(
          Number(row.duration),
          row.durationType as LeaveDurationType,
        ),
        reason: row.reason,
        attachmentUrl: row.attachmentUrl,
        workflowInstanceId: row.workflowInstanceId
          ? new Identifier<string>(row.workflowInstanceId)
          : null,
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

  toDTO(entity: LeaveRequestAggregate): LeaveResponseDto {
    return this.toResponseDto(entity);
  }

  toResponseDto(entity: LeaveRequestAggregate): LeaveResponseDto {
    const dto = new LeaveResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.employeeId = entity.employeeId.toString();
    dto.leaveTypeId = entity.leaveTypeId.toString();
    dto.status = entity.status;
    dto.startDate = entity.dateRange.startDate;
    dto.endDate = entity.dateRange.endDate;
    dto.durationDays = entity.duration.days;
    dto.isHalfDay = entity.duration.type === LeaveDurationType.HALF_DAY;
    dto.reason = entity.reason;
    dto.attachmentUrl = entity.attachmentUrl;
    dto.workflowInstanceId = entity.workflowInstanceId?.toString() || null;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toPersistence(entity: LeaveRequestAggregate): PrismaLeaveRequestRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      employeeId: entity.employeeId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      status: entity.status,
      startDate: entity.dateRange.startDate,
      endDate: entity.dateRange.endDate,
      duration: new Prisma.Decimal(entity.duration.days),
      durationType: entity.duration.type,
      reason: entity.reason,
      attachmentUrl: entity.attachmentUrl ?? null,
      workflowInstanceId: entity.workflowInstanceId?.toString() ?? null,
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
