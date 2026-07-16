export interface DocumentRenderContext {
  tenantId: string;
  companyId: string;
  profileId: string;
  employeeId?: string | null;
  candidateId?: string | null;
  workflowInstanceId?: string | null;

  placeholders: Record<string, string>;

  locale: string;
  timezone: string;
  currency: string;

  generatedDate: Date;
  metadata?: Record<string, any>;
}
