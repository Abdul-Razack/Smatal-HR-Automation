import { CompositeSpecification } from '../../../../../kernel/specifications/specification';
import { WorkflowDefinitionAggregate } from '../aggregates/WorkflowDefinitionAggregate';
import { WorkflowInstanceAggregate } from '../aggregates/WorkflowInstanceAggregate';
import { WorkflowStatus, WorkflowInstanceStatus } from '../enums/WorkflowEnums';

export class WorkflowDefinitionIsActiveSpecification extends CompositeSpecification<WorkflowDefinitionAggregate> {
  isSatisfiedBy(def: WorkflowDefinitionAggregate): boolean {
    return def.status === WorkflowStatus.ACTIVE && !def.isDeleted;
  }
}

export class WorkflowDefinitionIsPublishableSpecification extends CompositeSpecification<WorkflowDefinitionAggregate> {
  isSatisfiedBy(def: WorkflowDefinitionAggregate): boolean {
    return (
      def.status === WorkflowStatus.DRAFT &&
      def.stages.length > 0 &&
      !def.isDeleted
    );
  }
}

export class WorkflowInstanceIsInProgressSpecification extends CompositeSpecification<WorkflowInstanceAggregate> {
  isSatisfiedBy(inst: WorkflowInstanceAggregate): boolean {
    return (
      inst.status === WorkflowInstanceStatus.IN_PROGRESS && !inst.isDeleted
    );
  }
}

export class WorkflowInstanceBelongsToCompanySpecification extends CompositeSpecification<WorkflowInstanceAggregate> {
  constructor(private readonly companyId: string) {
    super();
  }
  isSatisfiedBy(inst: WorkflowInstanceAggregate): boolean {
    return inst.companyId.toString() === this.companyId;
  }
}

export class WorkflowDefinitionBelongsToCompanySpecification extends CompositeSpecification<WorkflowDefinitionAggregate> {
  constructor(private readonly companyId: string) {
    super();
  }
  isSatisfiedBy(def: WorkflowDefinitionAggregate): boolean {
    return def.companyId.toString() === this.companyId;
  }
}
