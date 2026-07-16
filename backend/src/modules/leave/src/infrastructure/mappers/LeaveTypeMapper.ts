import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { LeaveType } from '../../domain/entities/LeaveType';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { LeaveTypeResponseDto } from '../../application/dto/responses/LeaveResponses';
import { Prisma } from '@prisma/client';

export type PrismaLeaveTypeRow = Prisma.LeaveTypeGetPayload<{}>;

@Injectable()
export class LeaveTypeMapper implements Mapper<
  LeaveType,
  LeaveTypeResponseDto,
  PrismaLeaveTypeRow
> {
  toDomain(row: PrismaLeaveTypeRow): LeaveType {
    return LeaveType.create(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        name: row.name,
        code: row.code,
        description: row.description,
        colorCode: row.colorCode,
        isPaid: row.isPaid,
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

  toDTO(entity: LeaveType): LeaveTypeResponseDto {
    return this.toResponseDto(entity);
  }

  toResponseDto(entity: LeaveType): LeaveTypeResponseDto {
    const dto = new LeaveTypeResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.name = entity.name;
    dto.code = entity.code;
    dto.description = entity.description;
    dto.colorCode = entity.colorCode;
    dto.isPaid = entity.isPaid;
    dto.isActive = entity.isActive;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toPersistence(entity: LeaveType): PrismaLeaveTypeRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      name: entity.name,
      code: entity.code,
      description: entity.description ?? null,
      colorCode: entity.colorCode ?? null,
      isPaid: entity.isPaid,
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
