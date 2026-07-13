import { AuditLogAggregate } from '../aggregates/AuditLogAggregate';

export interface IAuditRepository {
  save(auditLog: AuditLogAggregate): Promise<void>;
  findByCompanyId(
    companyId: string,
    limit?: number,
    offset?: number,
  ): Promise<AuditLogAggregate[]>;
  findByEntityBusinessId(
    companyId: string,
    entityBusinessId: string,
  ): Promise<AuditLogAggregate[]>;
}
