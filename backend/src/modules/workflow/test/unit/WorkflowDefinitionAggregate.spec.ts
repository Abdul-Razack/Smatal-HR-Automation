import { WorkflowDefinitionAggregate } from '../../src/domain/aggregates/WorkflowDefinitionAggregate';
import { WorkflowStatus } from '../../src/domain/enums/WorkflowEnums';
import { Identifier } from '../../../../kernel/domain/Identifier';
import {
  WorkflowDefinitionAlreadyPublishedException,
  WorkflowDefinitionArchivedCannotModifyException,
  WorkflowDefinitionHasNoStagesException,
  WorkflowStageDuplicateCodeException,
} from '../../src/domain/exceptions/WorkflowExceptions';
import {
  WorkflowDefinitionCreatedEvent,
  WorkflowDefinitionUpdatedEvent,
  WorkflowDefinitionPublishedEvent,
  WorkflowStageAddedEvent,
  WorkflowDefinitionArchivedEvent,
} from '../../src/domain/events/WorkflowEvents';

describe('WorkflowDefinitionAggregate', () => {
  const companyId = new Identifier<string>('comp-1');
  const defId = new Identifier<string>('def-1');
  const performedBy = 'user-1';

  let definition: WorkflowDefinitionAggregate;

  beforeEach(() => {
    definition = WorkflowDefinitionAggregate.create(
      {
        businessId: 'WF_000001',
        companyId,
        name: 'Test Workflow',
        entityType: 'EMPLOYEE',
        status: WorkflowStatus.DRAFT,
        stages: [],
        version: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: performedBy,
        updatedBy: performedBy,
      },
      defId,
      performedBy,
    );
  });

  it('should create a DRAFT definition and emit Created event', () => {
    expect(definition.status).toBe(WorkflowStatus.DRAFT);
    expect(definition.stages.length).toBe(0);
    const events = definition.domainEvents;
    expect(events.length).toBe(1);
    expect(events[0]).toBeInstanceOf(WorkflowDefinitionCreatedEvent);
  });

  it('should update name and description and bump version', () => {
    const initialVersion = definition.version;
    definition.clearEvents();
    definition.update('New Name', 'New Desc', performedBy);

    expect(definition.name).toBe('New Name');
    expect(definition.description).toBe('New Desc');
    expect(definition.version).toBe(initialVersion + 1);
    expect(definition.domainEvents[0]).toBeInstanceOf(
      WorkflowDefinitionUpdatedEvent,
    );
  });

  it('should add a stage and maintain display order', () => {
    definition.clearEvents();
    definition.addStage(
      {
        id: 'stage-1',
        name: 'Stage 1',
        code: 'S1',
        displayOrder: 2,
        isTerminal: false,
        isFinal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: performedBy,
        updatedBy: performedBy,
      },
      performedBy,
    );

    definition.addStage(
      {
        id: 'stage-2',
        name: 'Stage 0',
        code: 'S0',
        displayOrder: 1,
        isTerminal: false,
        isFinal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: performedBy,
        updatedBy: performedBy,
      },
      performedBy,
    );

    expect(definition.stages.length).toBe(2);
    expect(definition.domainEvents[0]).toBeInstanceOf(WorkflowStageAddedEvent);

    const ordered = definition.orderedStages;
    expect(ordered[0].code).toBe('S0');
    expect(ordered[1].code).toBe('S1');
  });

  it('should throw when adding duplicate stage code', () => {
    definition.addStage(
      {
        id: 'stage-1',
        name: 'Stage 1',
        code: 'S1',
        displayOrder: 1,
        isTerminal: false,
        isFinal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: performedBy,
        updatedBy: performedBy,
      },
      performedBy,
    );

    expect(() => {
      definition.addStage(
        {
          id: 'stage-2',
          name: 'Another Stage 1',
          code: 'S1', // duplicate
          displayOrder: 2,
          isTerminal: false,
          isFinal: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: performedBy,
          updatedBy: performedBy,
        },
        performedBy,
      );
    }).toThrow(WorkflowStageDuplicateCodeException);
  });

  it('should not publish if no stages exist', () => {
    expect(() => definition.publish(performedBy)).toThrow(
      WorkflowDefinitionHasNoStagesException,
    );
  });

  it('should publish successfully if stages exist', () => {
    definition.addStage(
      {
        id: 'stage-1',
        name: 'Stage 1',
        code: 'S1',
        displayOrder: 1,
        isTerminal: false,
        isFinal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: performedBy,
        updatedBy: performedBy,
      },
      performedBy,
    );

    definition.clearEvents();
    definition.publish(performedBy);

    expect(definition.status).toBe(WorkflowStatus.ACTIVE);
    expect(definition.domainEvents[0]).toBeInstanceOf(
      WorkflowDefinitionPublishedEvent,
    );
  });

  it('should throw if publishing an already active definition', () => {
    definition.addStage(
      {
        id: 'stage-1',
        name: 'Stage 1',
        code: 'S1',
        displayOrder: 1,
        isTerminal: false,
        isFinal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: performedBy,
        updatedBy: performedBy,
      },
      performedBy,
    );
    definition.publish(performedBy);

    expect(() => definition.publish(performedBy)).toThrow(
      WorkflowDefinitionAlreadyPublishedException,
    );
  });

  it('should archive and prevent further modifications', () => {
    definition.clearEvents();
    definition.archive(performedBy);

    expect(definition.status).toBe(WorkflowStatus.ARCHIVED);
    expect(definition.domainEvents[0]).toBeInstanceOf(
      WorkflowDefinitionArchivedEvent,
    );

    expect(() => definition.update('Fail', null, performedBy)).toThrow(
      WorkflowDefinitionArchivedCannotModifyException,
    );
    expect(() => definition.publish(performedBy)).toThrow(
      WorkflowDefinitionArchivedCannotModifyException,
    );
  });
});
