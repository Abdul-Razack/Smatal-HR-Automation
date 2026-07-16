import {
  EventsHandler,
  IEventHandler,
  CommandBus,
} from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import {
  EmployeeCreatedEvent,
  EmployeeStatusChangedEvent,
  EmployeeTransferredEvent,
  EmployeePromotedEvent,
} from '../../domain/events/EmployeeEvents';
import { EmployeeStatus } from '../../domain/enums/EmployeeStatus';
import { StartWorkflowInstanceCommand } from '../../../../workflow/src/application/commands/StartWorkflowInstance/StartWorkflowInstanceCommand';
import { IWorkflowDefinitionRepository } from '../../../../workflow/src/domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowStatus } from '../../../../workflow/src/domain/enums/WorkflowEnums';

@EventsHandler(
  EmployeeCreatedEvent,
  EmployeeStatusChangedEvent,
  EmployeeTransferredEvent,
  EmployeePromotedEvent,
)
export class EmployeeWorkflowTriggerHandler
  implements
    IEventHandler<EmployeeCreatedEvent>,
    IEventHandler<EmployeeStatusChangedEvent>,
    IEventHandler<EmployeeTransferredEvent>,
    IEventHandler<EmployeePromotedEvent>
{
  private readonly logger = new Logger(EmployeeWorkflowTriggerHandler.name);

  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
  ) {}

  async handle(event: any) {
    let processCode: string | null = null;
    let businessId: string = event.employeeId;

    if (event instanceof EmployeeCreatedEvent) {
      processCode = 'APPOINTMENT_ORDER';
    } else if (event instanceof EmployeeStatusChangedEvent) {
      if (event.newStatus === EmployeeStatus.ACTIVE) {
        processCode = 'EMPLOYEE_CONFIRMATION';
      } else if (event.newStatus === EmployeeStatus.NOTICE) {
        processCode = 'RESIGNATION';
      } else if (event.newStatus === EmployeeStatus.TERMINATED) {
        processCode = 'TERMINATION';
      }
    } else if (event instanceof EmployeeTransferredEvent) {
      processCode = 'EMPLOYEE_TRANSFER';
    } else if (event instanceof EmployeePromotedEvent) {
      processCode = 'EMPLOYEE_PROMOTION';
    }

    if (processCode) {
      await this.triggerWorkflow(processCode, event.companyId, businessId, event.performedBy);
    }
  }

  private async triggerWorkflow(
    processCode: string,
    companyId: string,
    businessId: string,
    performedBy: string,
  ) {
    try {
      const def = await this.repo.findByProcessCodeAndCompany(
        processCode,
        companyId,
      );
      if (!def || def.status !== WorkflowStatus.ACTIVE) {
        this.logger.warn(
          `Workflow definition ${processCode} not found or inactive for company ${companyId}`,
        );
        return;
      }

      await this.commandBus.execute(
        new StartWorkflowInstanceCommand(
          companyId,
          performedBy,
          def.id.toString(),
          'EMPLOYEE',
          businessId,
          undefined,
          businessId, // For employee workflows, typically the employeeId is the business object
        ),
      );
      this.logger.log(
        `Triggered ${processCode} workflow for Employee ${businessId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to trigger workflow ${processCode}: ${error.message}`,
      );
    }
  }
}
