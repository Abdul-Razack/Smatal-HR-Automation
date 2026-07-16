import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { LeavePolicy } from '../../domain/entities/LeavePolicy';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { Prisma } from '@prisma/client';
import {
  LeaveAccrualType,
  CarryForwardType,
} from '../../domain/enums/LeaveEnums';
import { LeavePolicyResponseDto } from '../../application/dto/responses/LeaveResponses';

export type PrismaLeavePolicyRow = Prisma.LeavePolicyGetPayload<{}>;

@Injectable()
export class LeavePolicyMapper implements Mapper<
  LeavePolicy,
  LeavePolicyResponseDto,
  PrismaLeavePolicyRow
> {
  toDomain(row: PrismaLeavePolicyRow): LeavePolicy {
    return LeavePolicy.create(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        leaveTypeId: new Identifier<string>(row.leaveTypeId),
        name: row.name,
        description: row.description,
        annualEntitlement: Number(row.annualEntitlement),
        accrualType: row.accrualType as LeaveAccrualType,
        carryForwardType: row.carryForwardType as CarryForwardType,
        maxCarryForwardDays: row.maxCarryForwardDays
          ? Number(row.maxCarryForwardDays)
          : null,
        requiresAttachment: row.requiresAttachment,
        minDaysForAttachment: row.minDaysForAttachment,
        isActive: row.isActive,
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

  toDTO(entity: LeavePolicy): LeavePolicyResponseDto {
    return this.toResponseDto(entity);
  }

  toResponseDto(entity: LeavePolicy): LeavePolicyResponseDto {
    const dto = new LeavePolicyResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.leaveTypeId = entity.leaveTypeId.toString();
    dto.name = entity.name;
    dto.description = entity.description;
    dto.annualEntitlement = entity.annualEntitlement;
    dto.accrualType = entity.accrualType;
    dto.carryForwardType = entity.carryForwardType;
    dto.maxCarryForwardDays = entity.maxCarryForwardDays;
    dto.requiresAttachment = entity.requiresAttachment;
    dto.minDaysForAttachment = entity.minDaysForAttachment;
    dto.isActive = entity.isActive;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toPersistence(entity: LeavePolicy): PrismaLeavePolicyRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      leaveTypeId: entity.leaveTypeId.toString(),
      name: entity.name,
      description: entity.description ?? null,
      annualEntitlement: new Prisma.Decimal(entity.annualEntitlement),
      accrualType: entity.accrualType,
      carryForwardType: entity.carryForwardType,
      maxCarryForwardDays:
        entity.maxCarryForwardDays !== null
          ? new Prisma.Decimal(entity.maxCarryForwardDays)
          : null,
      requiresAttachment: entity.requiresAttachment,
      minDaysForAttachment: entity.minDaysForAttachment ?? null,
      isActive: entity.isActive,
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
