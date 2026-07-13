import { WorkflowInstanceStatus } from '../../../domain/enums/WorkflowEnums';
export class ListWorkflowInstancesQuery {
  constructor(
    public readonly companyId: string,
    public readonly status?: WorkflowInstanceStatus,
    public readonly entityType?: string,
    public readonly entityId?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
