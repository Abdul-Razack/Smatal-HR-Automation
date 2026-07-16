export interface AuditLog {
  id: string;
  companyId: string;
  entityType: string;
  entityBusinessId: string;
  action: string;
  userId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress?: string;
  correlationId?: string;
  remarks?: string;
  createdAt: string;
}

export interface AuditHistoryResponse {
  items: AuditLog[];
  total: number;
}
