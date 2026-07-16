import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { LeaveAppliedEvent } from '../../domain/events/LeaveEvents';
import { StartWorkflowInstanceCommand } from '../../../../workflow/src/application/commands/StartWorkflowInstance/StartWorkflowInstanceCommand';
import { IWorkflowDefinitionRepository } from '../../../../workflow/src/domain/repositories/IWorkflowDefinitionRepository';
import {
  WorkflowStatus,
  LifecycleProcessCode,
} from '../../../../workflow/src/domain/enums/WorkflowEnums';
import { ILeaveRequestRepository } from '../../domain/repositories/ILeaveRequestRepository';
import { IUnitOfWork } from '../../../../../infrastructure/database/transaction/IUnitOfWork';

@EventsHandler(LeaveAppliedEvent)
export class LeaveWorkflowTriggerHandler implements IEventHandler<LeaveAppliedEvent> {
  private readonly logger = new Logger(LeaveWorkflowTriggerHandler.name);

  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    @Inject('IUnitOfWork')
    private readonly uow: IUnitOfWork,
  ) {}

  async handle(event: LeaveAppliedEvent) {
    try {
      const processCode = LifecycleProcessCode.LEAVE_REQUEST;
      const def = await this.repo.findByProcessCodeAndCompany(
        processCode,
        event.companyId,
      );

      // Default: skip workflow gracefully if none configured
      if (!def || def.status !== WorkflowStatus.ACTIVE) {
        this.logger.warn(
          `Workflow definition ${processCode} not found or inactive for company ${event.companyId}. Leave ${event.leaveRequestId} will remain PENDING without a workflow.`,
        );
        return;
      }

      const workflowResult = await this.commandBus.execute(
        new StartWorkflowInstanceCommand(
          event.companyId,
          event.performedBy,
          def.id.toString(),
          'LEAVE_REQUEST',
          event.leaveRequestId,
          undefined,
          event.employeeId,
        ),
      );

      if (workflowResult.isSuccess) {
        const leave = await this.leaveRequestRepo.findById(
          event.leaveRequestId,
        );
        if (leave) {
          leave.props.workflowInstanceId = workflowResult.value;
          await this.uow.withTransaction(async () => {
            await this.leaveRequestRepo.save(leave);
          });
        }
      }

      this.logger.log(
        `Triggered ${processCode} workflow for Leave Request ${event.leaveRequestId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to trigger workflow LEAVE_REQUEST: ${error.message}`,
      );
    }
  }
}
