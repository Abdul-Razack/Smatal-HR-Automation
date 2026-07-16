import { EventsHandler, IEventHandler, EventBus } from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WorkflowInstanceCompletedEvent } from '../../../../workflow/src/domain/events/WorkflowEvents';
import { ILeaveRequestRepository } from '../../domain/repositories/ILeaveRequestRepository';
import { ILeaveBalanceRepository } from '../../domain/repositories/ILeaveBalanceRepository';
import { IUnitOfWork } from '../../../../../infrastructure/database/transaction/IUnitOfWork';
import { LeaveBalanceDomainService } from '../../domain/services/LeaveBalanceDomainService';
import {
  LeaveWorkflowCompletedEvent,
  LeaveBalanceUpdatedEvent,
} from '../../domain/events/LeaveEvents';

@EventsHandler(WorkflowInstanceCompletedEvent)
export class LeaveWorkflowCompletedHandler implements IEventHandler<WorkflowInstanceCompletedEvent> {
  private readonly logger = new Logger(LeaveWorkflowCompletedHandler.name);

  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepo: ILeaveRequestRepository,
    @Inject('ILeaveBalanceRepository')
    private readonly leaveBalanceRepo: ILeaveBalanceRepository,
    @Inject('IUnitOfWork')
    private readonly uow: IUnitOfWork,
    private readonly balanceDomainService: LeaveBalanceDomainService,
    private readonly eventBus: EventBus,
    @InjectQueue('audit.queue') private readonly auditQueue: Queue,
    @InjectQueue('notification.queue')
    private readonly notificationQueue: Queue,
  ) {}

  async handle(event: WorkflowInstanceCompletedEvent) {
    if (event.entityType !== 'LEAVE_REQUEST') return;

    try {
      const leave = await this.leaveRequestRepo.findById(event.entityId);
      if (!leave) {
        this.logger.warn(
          `Leave request ${event.entityId} not found upon workflow completion.`,
        );
        return;
      }

      // 1. Approve Leave Request
      leave.approve(event.performedBy);

      // 2. Update Leave Balance
      const currentYear = new Date().getFullYear();
      const balance = await this.leaveBalanceRepo.findSpecificBalance(
        leave.employeeId.toString(),
        leave.leaveTypeId.toString(),
        currentYear,
      );

      if (balance) {
        this.balanceDomainService.commitApprovedBalance(
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
        new LeaveWorkflowCompletedEvent(
          leave.id.toString(),
          leave.companyId.toString(),
          leave.employeeId.toString(),
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
      await this.auditQueue.add('log-leave-approved', {
        companyId: leave.companyId.toString(),
        entityType: 'LeaveRequest',
        entityBusinessId: leave.businessId,
        action: 'LEAVE_APPROVED',
        performedBy: event.performedBy,
        afterState: { status: 'APPROVED' },
        correlationId: `${leave.id.toString()}-APPROVE-${Date.now()}`,
      });

      await this.notificationQueue.add('notify-leave-approved', {
        companyId: leave.companyId.toString(),
        title: 'Leave Approved',
        message: `Your leave request for ${leave.duration.days} day(s) has been approved.`,
        notificationType: 'LEAVE_UPDATE',
        priority: 'HIGH',
        recipient: leave.employeeId.toString(),
      });

      this.logger.log(
        `Completed Leave Approval Workflow for Request ${leave.id.toString()}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to handle leave workflow completion: ${error.message}`,
        error.stack,
      );
    }
  }
}
