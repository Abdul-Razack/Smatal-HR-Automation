import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { LeaveBalance } from '../../domain/entities/LeaveBalance';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { Prisma } from '@prisma/client';
import { LeaveBalanceType } from '../../domain/enums/LeaveEnums';
import { LeaveBalanceResponseDto } from '../../application/dto/responses/LeaveResponses';

export type PrismaLeaveBalanceRow = Prisma.LeaveBalanceGetPayload<{}>;

@Injectable()
export class LeaveBalanceMapper implements Mapper<
  LeaveBalance,
  LeaveBalanceResponseDto,
  PrismaLeaveBalanceRow
> {
  toDomain(row: PrismaLeaveBalanceRow): LeaveBalance {
    return LeaveBalance.create(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        employeeId: new Identifier<string>(row.employeeId),
        leaveTypeId: new Identifier<string>(row.leaveTypeId),
        year: row.year,
        balanceType: row.balanceType as LeaveBalanceType,
        totalEntitlement: Number(row.totalEntitlement),
        accruedDays: Number(row.accruedDays),
        carriedForward: Number(row.carriedForward),
        usedDays: Number(row.usedDays),
        pendingDays: Number(row.pendingDays),
        version: row.version,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        createdBy: row.createdBy,
        updatedBy: row.updatedBy,
      },
      new Identifier<string>(row.id),
    );
  }

  toDTO(entity: LeaveBalance): LeaveBalanceResponseDto {
    return this.toResponseDto(entity);
  }

  toResponseDto(entity: LeaveBalance): LeaveBalanceResponseDto {
    const dto = new LeaveBalanceResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.employeeId = entity.employeeId.toString();
    dto.leaveTypeId = entity.leaveTypeId.toString();
    dto.year = entity.year;
    dto.balanceType = entity.balanceType;
    dto.totalEntitlement = entity.totalEntitlement;
    dto.accruedDays = entity.accruedDays;
    dto.carriedForward = entity.carriedForward;
    dto.usedDays = entity.usedDays;
    dto.pendingDays = entity.pendingDays;
    dto.remainingBalance = entity.remainingBalance;
    dto.availableBalance = entity.availableBalance;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    return dto;
  }

  toPersistence(entity: LeaveBalance): PrismaLeaveBalanceRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      employeeId: entity.employeeId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      year: entity.year,
      balanceType: entity.balanceType,
      totalEntitlement: new Prisma.Decimal(entity.totalEntitlement),
      accruedDays: new Prisma.Decimal(entity.accruedDays),
      carriedForward: new Prisma.Decimal(entity.carriedForward),
      usedDays: new Prisma.Decimal(entity.usedDays),
      pendingDays: new Prisma.Decimal(entity.pendingDays),
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
