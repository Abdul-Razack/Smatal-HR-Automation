import { Mapper } from '../../../../../kernel/mapping/mapping.contracts';
import { AuditLogAggregate } from '../../domain/aggregates/AuditLogAggregate';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { Prisma } from '@prisma/client';
import { AuditAction } from '../../domain/enums/AuditAction';

export class AuditMapper implements Mapper<AuditLogAggregate, any, any> {
  toDomain(row: any): AuditLogAggregate {
    return AuditLogAggregate.create(
      {
        businessId: row.businessId,
        companyId: row.companyId,
        entityType: row.entityType,
        entityBusinessId: row.entityBusinessId,
        action: row.action as AuditAction,
        beforeState: row.beforeState as Record<string, any> | null,
        afterState: row.afterState as Record<string, any> | null,
        performedBy: row.performedBy,
        performedAt: row.performedAt,
        ipAddress: row.ipAddress,
        correlationId: row.correlationId,
        remarks: row.remarks,
      },
      new Identifier<string>(row.id),
    );
  }

  toPersistence(domain: AuditLogAggregate): any {
    return {
      id: domain.id.toValue() as string,
      businessId: domain.businessId,
      companyId: domain.companyId,
      entityType: domain.entityType,
      entityBusinessId: domain.entityBusinessId,
      action: domain.action,
      beforeState: (domain.beforeState as any) ?? null,
      afterState: (domain.afterState as any) ?? null,
      performedBy: domain.performedBy,
      performedAt: domain.performedAt,
      ipAddress: domain.ipAddress ?? null,
      correlationId: domain.correlationId ?? null,
      remarks: domain.remarks ?? null,
    };
  }

  toDTO(domain: AuditLogAggregate): any {
    return {
      id: domain.id.toValue(),
      businessId: domain.businessId,
      companyId: domain.companyId,
      entityType: domain.entityType,
      entityBusinessId: domain.entityBusinessId,
      action: domain.action,
      beforeState: domain.beforeState,
      afterState: domain.afterState,
      performedBy: domain.performedBy,
      performedAt: domain.performedAt,
      ipAddress: domain.ipAddress,
      correlationId: domain.correlationId,
      remarks: domain.remarks,
    };
  }
}
