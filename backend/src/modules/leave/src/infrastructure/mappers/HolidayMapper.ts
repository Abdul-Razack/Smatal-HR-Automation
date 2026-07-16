import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { Holiday } from '../../domain/entities/Holiday';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { Prisma } from '@prisma/client';
import { HolidayType } from '../../domain/enums/LeaveEnums';
import { HolidayResponseDto } from '../../application/dto/responses/LeaveResponses';

export type PrismaHolidayRow = Prisma.HolidayGetPayload<{}>;

@Injectable()
export class HolidayMapper implements Mapper<
  Holiday,
  HolidayResponseDto,
  PrismaHolidayRow
> {
  toDomain(row: PrismaHolidayRow): Holiday {
    return Holiday.create(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        name: row.name,
        date: row.date,
        type: row.type as HolidayType,
        description: row.description,
        branchId: row.branchId ? new Identifier<string>(row.branchId) : null,
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

  toDTO(entity: Holiday): HolidayResponseDto {
    return this.toResponseDto(entity);
  }

  toResponseDto(entity: Holiday): HolidayResponseDto {
    const dto = new HolidayResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.name = entity.name;
    dto.date = entity.date;
    dto.type = entity.type;
    dto.description = entity.description;
    dto.branchId = entity.branchId?.toString() || null;
    dto.isActive = entity.isActive;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toPersistence(entity: Holiday): PrismaHolidayRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      name: entity.name,
      date: entity.date,
      type: entity.type,
      description: entity.description ?? null,
      branchId: entity.branchId?.toString() ?? null,
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
