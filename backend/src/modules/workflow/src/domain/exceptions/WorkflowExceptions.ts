import { DomainException } from '../../../../../kernel/domain/DomainException';

export class WorkflowDefinitionNotFoundException extends DomainException {
  constructor(id: string) {
    super(`WorkflowDefinition not found: ${id}`, 'NOT_FOUND');
  }
}

export class WorkflowInstanceNotFoundException extends DomainException {
  constructor(id: string) {
    super(`WorkflowInstance not found: ${id}`, 'NOT_FOUND');
  }
}

export class WorkflowDefinitionNotActiveException extends DomainException {
  constructor(id: string) {
    super(
      `WorkflowDefinition ${id} is not ACTIVE and cannot start instances`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowDefinitionAlreadyPublishedException extends DomainException {
  constructor(id: string) {
    super(
      `WorkflowDefinition ${id} is already ACTIVE`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowDefinitionHasNoStagesException extends DomainException {
  constructor(id: string) {
    super(
      `WorkflowDefinition ${id} must have at least one stage before publishing`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowDefinitionArchivedCannotModifyException extends DomainException {
  constructor(id: string) {
    super(
      `WorkflowDefinition ${id} is ARCHIVED and cannot be modified`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowStageDuplicateCodeException extends DomainException {
  constructor(code: string) {
    super(
      `Stage with code "${code}" already exists in this workflow definition`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowStageNotFoundException extends DomainException {
  constructor(stageId: string) {
    super(`WorkflowStage not found: ${stageId}`, 'NOT_FOUND');
  }
}

export class WorkflowInstanceNotInProgressException extends DomainException {
  constructor(instanceId: string) {
    super(
      `WorkflowInstance ${instanceId} is not IN_PROGRESS`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowInstanceAlreadyCompletedException extends DomainException {
  constructor(instanceId: string) {
    super(
      `WorkflowInstance ${instanceId} is already COMPLETED`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowInstanceAlreadyCancelledException extends DomainException {
  constructor(instanceId: string) {
    super(
      `WorkflowInstance ${instanceId} is already CANCELLED`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowNoCurrentStageException extends DomainException {
  constructor(instanceId: string) {
    super(
      `WorkflowInstance ${instanceId} has no current stage`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowReturnTargetInvalidException extends DomainException {
  constructor(targetStageId: string) {
    super(
      `Cannot return to stage ${targetStageId} — it does not exist in the workflow definition`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class WorkflowCompanyMismatchException extends DomainException {
  constructor() {
    super('Workflow resource does not belong to this company', 'NOT_FOUND');
  }
}
