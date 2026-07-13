import {
  EventsHandler,
  IEventHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import {
  CandidateStatusChangedEvent,
  CandidateCreatedEvent,
} from '../../../../candidate/src/domain/events/CandidateEvents';
import { CandidateStatus } from '../../../../candidate/src/domain/enums/CandidateStatus';
import {
  EmployeeStatusChangedEvent,
  EmployeeCreatedEvent,
} from '../../../../employee/src/domain/events/EmployeeEvents';
import { EmployeeStatus } from '../../../../employee/src/domain/enums/EmployeeStatus';
import { StartWorkflowInstanceCommand } from '../commands/StartWorkflowInstance/StartWorkflowInstanceCommand';
import { IWorkflowDefinitionRepository } from '../../domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowStatus } from '../../domain/enums/WorkflowEnums';

@EventsHandler(CandidateStatusChangedEvent)
export class CandidateWorkflowTriggerHandler implements IEventHandler<CandidateStatusChangedEvent> {
  private readonly logger = new Logger(CandidateWorkflowTriggerHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
  ) {}

  async handle(event: CandidateStatusChangedEvent) {
    let processCode: string | null = null;

    if (event.newStatus === CandidateStatus.SELECTED) {
      processCode = 'OFFER_LETTER';
    } else if (event.newStatus === CandidateStatus.CONVERTED) {
      processCode = 'OFFER_ACCEPTANCE';
    }

    if (processCode) {
      await this.triggerWorkflow(processCode, event);
    }
  }

  private async triggerWorkflow(
    processCode: string,
    event: CandidateStatusChangedEvent,
  ) {
    try {
      const def = await this.repo.findByProcessCodeAndCompany(
        processCode,
        event.companyId,
      );
      if (!def || def.status !== WorkflowStatus.ACTIVE) {
        this.logger.warn(
          `Workflow definition ${processCode} not found or inactive for company ${event.companyId}`,
        );
        return;
      }

      await this.commandBus.execute(
        new StartWorkflowInstanceCommand(
          event.companyId,
          event.performedBy,
          def.id.toString(),
          'CANDIDATE',
          event.candidateId,
          event.candidateId,
          undefined,
        ),
      );
      this.logger.log(
        `Triggered ${processCode} workflow for Candidate ${event.candidateId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to trigger workflow ${processCode}: ${error.message}`,
      );
    }
  }
}

@EventsHandler(EmployeeStatusChangedEvent)
export class EmployeeWorkflowTriggerHandler implements IEventHandler<EmployeeStatusChangedEvent> {
  private readonly logger = new Logger(EmployeeWorkflowTriggerHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
  ) {}

  async handle(event: EmployeeStatusChangedEvent) {
    let processCode: string | null = null;

    if (event.newStatus === EmployeeStatus.ACTIVE) {
      processCode = 'EMPLOYEE_CONFIRMATION';
    } else if (event.newStatus === EmployeeStatus.NOTICE) {
      processCode = 'RESIGNATION';
    } else if (event.newStatus === EmployeeStatus.TERMINATED) {
      processCode = 'TERMINATION';
    }

    if (processCode) {
      await this.triggerWorkflow(processCode, event);
    }
  }

  private async triggerWorkflow(
    processCode: string,
    event: EmployeeStatusChangedEvent,
  ) {
    try {
      const def = await this.repo.findByProcessCodeAndCompany(
        processCode,
        event.companyId,
      );
      if (!def || def.status !== WorkflowStatus.ACTIVE) {
        this.logger.warn(
          `Workflow definition ${processCode} not found or inactive for company ${event.companyId}`,
        );
        return;
      }

      await this.commandBus.execute(
        new StartWorkflowInstanceCommand(
          event.companyId,
          event.performedBy,
          def.id.toString(),
          'EMPLOYEE',
          event.employeeId,
          undefined,
          event.employeeId,
        ),
      );
      this.logger.log(
        `Triggered ${processCode} workflow for Employee ${event.employeeId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to trigger workflow ${processCode}: ${error.message}`,
      );
    }
  }
}

@EventsHandler(EmployeeCreatedEvent)
export class NewHireWorkflowTriggerHandler implements IEventHandler<EmployeeCreatedEvent> {
  private readonly logger = new Logger(NewHireWorkflowTriggerHandler.name);

  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
  ) {}

  async handle(event: EmployeeCreatedEvent) {
    // When a new employee is created, trigger appointment order workflow
    const processCode = 'APPOINTMENT_ORDER';

    try {
      const def = await this.repo.findByProcessCodeAndCompany(
        processCode,
        event.companyId,
      );
      if (!def || def.status !== WorkflowStatus.ACTIVE) {
        this.logger.warn(
          `Workflow definition ${processCode} not found or inactive for company ${event.companyId}`,
        );
        return;
      }

      await this.commandBus.execute(
        new StartWorkflowInstanceCommand(
          event.companyId,
          event.performedBy,
          def.id.toString(),
          'EMPLOYEE',
          event.employeeId,
          undefined,
          event.employeeId,
        ),
      );
      this.logger.log(
        `Triggered ${processCode} workflow for new Employee ${event.employeeId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to trigger workflow ${processCode}: ${error.message}`,
      );
    }
  }
}
