import { Injectable } from '@nestjs/common';
import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { EmploymentHistoryEntity } from '../../domain/entities/EmploymentHistoryEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface PrismaEmploymentHistoryRow {
  id: string;
  employeeId: string;
  companyId: string;
  changeType: string;
  previousValue: string | null;
  newValue: string | null;
  effectiveDate: Date;
  notes: string | null;
  createdAt: Date;
  createdBy: string;
}

@Injectable()
export class EmploymentHistoryMapper implements Mapper<
  EmploymentHistoryEntity,
  any,
  PrismaEmploymentHistoryRow
> {
  toDomain(row: PrismaEmploymentHistoryRow): EmploymentHistoryEntity {
    return EmploymentHistoryEntity.reconstitute(
      {
        companyId: new Identifier<string>(row.companyId),
        employeeId: row.employeeId,
        changeType: row.changeType,
        previousValue: row.previousValue,
        newValue: row.newValue,
        effectiveDate: row.effectiveDate,
        notes: row.notes,
        createdAt: row.createdAt,
        createdBy: row.createdBy,
      },
      new Identifier<string>(row.id),
    );
  }

  toDTO(entity: EmploymentHistoryEntity): any {
    return {
      id: entity.id.toString(),
      employeeId: entity.employeeId,
      companyId: entity.companyId.toString(),
      changeType: entity.changeType,
      previousValue: entity.previousValue,
      newValue: entity.newValue,
      effectiveDate: entity.effectiveDate,
      notes: entity.notes,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    };
  }

  toPersistence(entity: EmploymentHistoryEntity): PrismaEmploymentHistoryRow {
    return {
      id: entity.id.toString(),
      employeeId: entity.employeeId,
      companyId: entity.companyId.toString(),
      changeType: entity.changeType,
      previousValue: entity.previousValue ?? null,
      newValue: entity.newValue ?? null,
      effectiveDate: entity.effectiveDate,
      notes: entity.notes ?? null,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    };
  }
}
