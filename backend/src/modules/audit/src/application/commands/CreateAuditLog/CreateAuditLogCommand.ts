import { AuditAction } from '../../../domain/enums/AuditAction';

export class CreateAuditLogCommand {
  constructor(
    public readonly companyId: string,
    public readonly entityType: string,
    public readonly entityBusinessId: string,
    public readonly action: AuditAction,
    public readonly performedBy: string,
    public readonly beforeState?: Record<string, any> | null,
    public readonly afterState?: Record<string, any> | null,
    public readonly ipAddress?: string | null,
    public readonly correlationId?: string | null,
    public readonly remarks?: string | null,
  ) {}
}
