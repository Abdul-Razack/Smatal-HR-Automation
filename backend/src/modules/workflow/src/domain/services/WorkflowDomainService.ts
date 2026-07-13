import { Injectable } from '@nestjs/common';
import { WorkflowDefinitionAggregate } from '../aggregates/WorkflowDefinitionAggregate';
import { WorkflowInstanceAggregate } from '../aggregates/WorkflowInstanceAggregate';
import {
  WorkflowDefinitionNotActiveException,
  WorkflowCompanyMismatchException,
  WorkflowInstanceNotFoundException,
  WorkflowDefinitionNotFoundException,
} from '../exceptions/WorkflowExceptions';
import { WorkflowDefinitionIsActiveSpecification } from '../specifications/WorkflowSpecifications';

@Injectable()
export class WorkflowDomainService {
  private readonly isActiveSpec = new WorkflowDefinitionIsActiveSpecification();

  /**
   * Asserts that the definition is ACTIVE and belongs to the company.
   */
  assertDefinitionCanStartInstance(
    def: WorkflowDefinitionAggregate,
    companyId: string,
  ): void {
    if (def.companyId.toString() !== companyId)
      throw new WorkflowCompanyMismatchException();
    if (!this.isActiveSpec.isSatisfiedBy(def)) {
      throw new WorkflowDefinitionNotActiveException(def.id.toString());
    }
  }

  assertDefinitionBelongsToCompany(
    def: WorkflowDefinitionAggregate | null,
    id: string,
    companyId: string,
  ): WorkflowDefinitionAggregate {
    if (!def) throw new WorkflowDefinitionNotFoundException(id);
    if (def.companyId.toString() !== companyId)
      throw new WorkflowCompanyMismatchException();
    return def;
  }

  assertInstanceBelongsToCompany(
    inst: WorkflowInstanceAggregate | null,
    id: string,
    companyId: string,
  ): WorkflowInstanceAggregate {
    if (!inst) throw new WorkflowInstanceNotFoundException(id);
    if (inst.companyId.toString() !== companyId)
      throw new WorkflowCompanyMismatchException();
    return inst;
  }

  /**
   * Resolves the next stage from a definition given the current stage.
   * Returns null if we are at the last stage (signal to complete).
   */
  resolveNextStage(
    def: WorkflowDefinitionAggregate,
    currentStageId: string,
  ): string | null {
    const next = def.getNextStage(currentStageId);
    return next?.id ?? null;
  }
}
