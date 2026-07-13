import { WorkflowStatus } from '../../../domain/enums/WorkflowEnums';
export class ListWorkflowDefinitionsQuery {
  constructor(
    public readonly companyId: string,
    public readonly status?: WorkflowStatus,
    public readonly entityType?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
