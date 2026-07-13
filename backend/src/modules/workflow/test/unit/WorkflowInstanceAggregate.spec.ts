import { WorkflowInstanceAggregate } from '../../src/domain/aggregates/WorkflowInstanceAggregate';
import {
  WorkflowInstanceStatus,
  WorkflowAction,
} from '../../src/domain/enums/WorkflowEnums';
import { Identifier } from '../../../../kernel/domain/Identifier';
import {
  WorkflowInstanceNotInProgressException,
  WorkflowNoCurrentStageException,
  WorkflowInstanceAlreadyCompletedException,
  WorkflowReturnTargetInvalidException,
} from '../../src/domain/exceptions/WorkflowExceptions';
import {
  WorkflowInstanceStartedEvent,
  WorkflowStageAdvancedEvent,
  WorkflowInstanceCompletedEvent,
  WorkflowStageRejectedEvent,
  WorkflowStageReturnedEvent,
  WorkflowInstanceCancelledEvent,
} from '../../src/domain/events/WorkflowEvents';

describe('WorkflowInstanceAggregate', () => {
  const companyId = new Identifier<string>('comp-1');
  const instanceId = new Identifier<string>('inst-1');
  const defId = 'def-1';
  const entityId = 'emp-1';
  const performedBy = 'user-1';

  let instance: WorkflowInstanceAggregate;

  beforeEach(() => {
    instance = WorkflowInstanceAggregate.create(
      {
        businessId: 'WFI_000001',
        companyId,
        workflowDefinitionId: defId,
        entityType: 'EMPLOYEE',
        entityId,
        candidateId: null,
        employeeId: entityId,
        currentStageId: null,
        status: WorkflowInstanceStatus.PENDING,
        startedAt: null,
        completedAt: null,
        definitionStageIds: ['stage-1', 'stage-2', 'stage-3'],
        history: [],
        version: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: performedBy,
        updatedBy: performedBy,
      },
      instanceId,
      performedBy,
    );
  });

  it('should create PENDING instance and emit Started event', () => {
    expect(instance.status).toBe(WorkflowInstanceStatus.PENDING);
    expect(instance.currentStageId).toBeNull();
    const events = instance.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(WorkflowInstanceStartedEvent);
  });

  it('should start instance at first stage and record history', () => {
    instance.clearEvents();
    instance.start('stage-1', performedBy);

    expect(instance.status).toBe(WorkflowInstanceStatus.IN_PROGRESS);
    expect(instance.currentStageId).toBe('stage-1');
    expect(instance.history.length).toBe(1);
    expect(instance.history[0].action).toBe(WorkflowAction.START);
    expect(instance.history[0].stageId).toBe('stage-1');
  });

  it('should throw if starting an already started instance', () => {
    instance.start('stage-1', performedBy);
    expect(() => instance.start('stage-2', performedBy)).toThrow(
      WorkflowInstanceNotInProgressException,
    );
  });

  it('should advance to next stage and record history', () => {
    instance.start('stage-1', performedBy);
    instance.clearEvents();

    instance.advance('stage-2', performedBy, 'Moving forward');

    expect(instance.currentStageId).toBe('stage-2');
    expect(instance.history.length).toBe(2);
    expect(instance.history[1].action).toBe(WorkflowAction.ADVANCE);

    expect(instance.domainEvents.length).toBe(1);
    expect(instance.domainEvents[0]).toBeInstanceOf(WorkflowStageAdvancedEvent);
  });

  it('should approve current stage and move to next', () => {
    instance.start('stage-1', performedBy);
    instance.clearEvents();

    instance.approve('stage-2', performedBy, 'Looks good');

    expect(instance.currentStageId).toBe('stage-2');
    expect(instance.history.length).toBe(2);
    expect(instance.history[1].action).toBe(WorkflowAction.APPROVE);
    expect(instance.domainEvents[0]).toBeInstanceOf(WorkflowStageAdvancedEvent);
  });

  it('should complete when approving the final stage (nextStageId is null)', () => {
    instance.start('stage-3', performedBy);
    instance.clearEvents();

    instance.approve(null, performedBy, 'Final approval');

    expect(instance.status).toBe(WorkflowInstanceStatus.COMPLETED);
    expect(instance.currentStageId).toBeNull();
    expect(instance.completedAt).not.toBeNull();

    // START, APPROVE, COMPLETE
    expect(instance.history.length).toBe(3);
    expect(instance.history[2].action).toBe(WorkflowAction.COMPLETE);

    expect(instance.domainEvents[0]).toBeInstanceOf(
      WorkflowInstanceCompletedEvent,
    );
  });

  it('should reject and mark FAILED', () => {
    instance.start('stage-1', performedBy);
    instance.clearEvents();

    instance.reject(performedBy, 'Failed review');

    expect(instance.status).toBe(WorkflowInstanceStatus.FAILED);
    expect(instance.history.length).toBe(2);
    expect(instance.history[1].action).toBe(WorkflowAction.REJECT);
    expect(instance.domainEvents[0]).toBeInstanceOf(WorkflowStageRejectedEvent);
  });

  it('should return to a previous stage', () => {
    instance.start('stage-2', performedBy);
    instance.clearEvents();

    instance.returnToStage('stage-1', performedBy, 'Missing documents');

    expect(instance.currentStageId).toBe('stage-1');
    expect(instance.history.length).toBe(2);
    expect(instance.history[1].action).toBe(WorkflowAction.RETURN);
    expect(instance.domainEvents[0]).toBeInstanceOf(WorkflowStageReturnedEvent);
  });

  it('should throw if returning to a non-existent stage in definition', () => {
    instance.start('stage-2', performedBy);
    expect(() =>
      instance.returnToStage('invalid-stage', performedBy, 'Reason'),
    ).toThrow(WorkflowReturnTargetInvalidException);
  });

  it('should cancel the workflow', () => {
    instance.start('stage-1', performedBy);
    instance.clearEvents();

    instance.cancel(performedBy, 'No longer needed');

    expect(instance.status).toBe(WorkflowInstanceStatus.CANCELLED);
    expect(instance.history[1].action).toBe(WorkflowAction.CANCEL);
    expect(instance.domainEvents[0]).toBeInstanceOf(
      WorkflowInstanceCancelledEvent,
    );
  });

  it('should throw when advancing a completed workflow', () => {
    instance.start('stage-3', performedBy);
    instance.approve(null, performedBy, 'Final'); // completes it

    expect(() => instance.advance('stage-1', performedBy)).toThrow(
      WorkflowInstanceAlreadyCompletedException,
    );
  });
});
