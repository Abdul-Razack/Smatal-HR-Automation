import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import {
  CandidateAggregate,
  CandidateProps,
} from '../../domain/aggregates/CandidateAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { CandidateStatus } from '../../domain/enums/CandidateStatus';
import { CandidateResponseDto } from '../../application/dto/responses/CandidateResponseDto';

// Shape that comes from Prisma (typed loosely to avoid Prisma import leaking into domain)
export interface PrismaCandidateRow {
  id: string;
  businessId: string;
  profileId: string;
  companyId: string;
  status: string;
  appliedDate: Date | null;
  source: string | null;
  referredBy: string | null;
  notes: string | null;
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
export class CandidateMapper implements Mapper<
  CandidateAggregate,
  CandidateResponseDto,
  PrismaCandidateRow
> {
  toDomain(row: PrismaCandidateRow): CandidateAggregate {
    return CandidateAggregate.reconstitute(
      {
        businessId: row.businessId,
        companyId: new Identifier<string>(row.companyId),
        profileId: row.profileId,
        status: row.status as CandidateStatus,
        appliedDate: row.appliedDate,
        source: row.source,
        referredBy: row.referredBy,
        notes: row.notes,
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

  toDTO(entity: CandidateAggregate): CandidateResponseDto {
    return this.toResponseDto(entity);
  }

  toResponseDto(entity: CandidateAggregate): CandidateResponseDto {
    const dto = new CandidateResponseDto();
    dto.id = entity.id.toString();
    dto.businessId = entity.businessId;
    dto.companyId = entity.companyId.toString();
    dto.profileId = entity.profileId;
    dto.status = entity.status;
    dto.appliedDate = entity.appliedDate;
    dto.source = entity.source;
    dto.referredBy = entity.referredBy;
    dto.notes = entity.notes;
    dto.version = entity.version;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.createdBy = entity.createdBy;
    dto.updatedBy = entity.updatedBy;
    dto.isDeleted = entity.isDeleted;
    return dto;
  }

  toPersistence(entity: CandidateAggregate): PrismaCandidateRow {
    return {
      id: entity.id.toString(),
      businessId: entity.businessId,
      companyId: entity.companyId.toString(),
      profileId: entity.profileId,
      status: entity.status,
      appliedDate: entity.appliedDate ?? null,
      source: entity.source ?? null,
      referredBy: entity.referredBy ?? null,
      notes: entity.notes ?? null,
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
