import { EventsHandler, IEventHandler, EventBus } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WorkflowStageRejectedEvent } from '../../../../workflow/src/domain/events/WorkflowEvents';
import { ILeaveRequestRepository } from '../../domain/repositories/ILeaveRequestRepository';
import { ILeaveBalanceRepository } from '../../domain/repositories/ILeaveBalanceRepository';
import { IWorkflowInstanceRepository } from '../../../../workflow/src/domain/repositories/IWorkflowInstanceRepository';
import { IUnitOfWork } from '../../../../../infrastructure/database/transaction/IUnitOfWork';
import { LeaveBalanceDomainService } from '../../domain/services/LeaveBalanceDomainService';
import {
  LeaveRejectedEvent,
  LeaveBalanceUpdatedEvent,
} from '../../domain/events/LeaveEvents';

@EventsHandler(WorkflowStageRejectedEvent)
export class LeaveWorkflowRejectedHandler implements IEventHandler<WorkflowStageRejectedEvent> {
  private readonly logger = new Logger(LeaveWorkflowRejectedHandler.name);

  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    @Inject('ILeaveBalanceRepository')
    private readonly leaveBalanceRepo: ILeaveBalanceRepository,
    @Inject('IWorkflowInstanceRepository')
    private readonly workflowInstanceRepo: IWorkflowInstanceRepository,
    @Inject('IUnitOfWork')
    private readonly uow: IUnitOfWork,
    private readonly balanceDomainService: LeaveBalanceDomainService,
    private readonly eventBus: EventBus,
    @InjectQueue('audit.queue') private readonly auditQueue: Queue,
    @InjectQueue('notification.queue')
    private readonly notificationQueue: Queue,
  ) {}

  async handle(event: WorkflowStageRejectedEvent) {
    try {
      const workflowInstance = await this.workflowInstanceRepo.findById(
        event.instanceId,
      );
      if (
        !workflowInstance ||
        workflowInstance.entityType !== 'LEAVE_REQUEST'
      ) {
        return;
      }

      const leave = await this.leaveRequestRepo.findById(
        workflowInstance.entityId,
      );
      if (!leave) {
        this.logger.warn(
          `Leave request ${workflowInstance.entityId} not found upon workflow rejection.`,
        );
        return;
      }

      // 1. Reject Leave Request
      leave.reject(event.performedBy);

      // 2. Update Leave Balance (Restore Pending)
      const currentYear = new Date().getFullYear();
      const balance = await this.leaveBalanceRepo.findSpecificBalance(
        leave.employeeId.toString(),
        leave.leaveTypeId.toString(),
        currentYear,
      );

      if (balance) {
        this.balanceDomainService.restorePendingBalance(
          balance,
          leave.duration.days,
          event.performedBy,
        );
      }

      await this.uow.withTransaction(async () => {
        await this.leaveRequestRepo.save(leave);
        if (balance) {
          await this.leaveBalanceRepo.save(balance);
        }
      });

      // 3. Publish Events
      this.eventBus.publish(
        new LeaveRejectedEvent(
          leave.id.toString(),
          leave.companyId.toString(),
          leave.employeeId.toString(),
          event.reason,
          event.performedBy,
        ),
      );

      if (balance) {
        this.eventBus.publish(
          new LeaveBalanceUpdatedEvent(
            leave.id.toString(),
            leave.companyId.toString(),
            leave.employeeId.toString(),
            leave.leaveTypeId.toString(),
            event.performedBy,
          ),
        );
      }

      // 4. Enqueue Audit and Notification Jobs
      await this.auditQueue.add('log-leave-rejected', {
        companyId: leave.companyId.toString(),
        entityType: 'LeaveRequest',
        entityBusinessId: leave.businessId,
        action: 'LEAVE_REJECTED',
        performedBy: event.performedBy,
        afterState: { status: 'REJECTED', reason: event.reason },
        correlationId: `${leave.id.toString()}-REJECT-${Date.now()}`,
      });

      await this.notificationQueue.add('notify-leave-rejected', {
        companyId: leave.companyId.toString(),
        title: 'Leave Rejected',
        message: `Your leave request has been rejected. Reason: ${event.reason}`,
        notificationType: 'LEAVE_UPDATE',
        priority: 'HIGH',
        recipient: leave.employeeId.toString(),
      });

      this.logger.log(
        `Completed Leave Rejection Workflow for Request ${leave.id.toString()}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to handle leave workflow rejection: ${error.message}`,
        error.stack,
      );
    }
  }
}
