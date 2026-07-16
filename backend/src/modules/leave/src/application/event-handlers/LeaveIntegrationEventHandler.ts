import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import {
  LeaveAppliedEvent,
  LeaveApprovedEvent,
  LeaveRejectedEvent,
  LeaveCancelledEvent,
  LeaveBalanceUpdatedEvent,
  LeaveEscalatedEvent,
} from '../../domain/events/LeaveEvents';

@Injectable()
@EventsHandler(
  LeaveAppliedEvent,
  LeaveApprovedEvent,
  LeaveRejectedEvent,
  LeaveCancelledEvent,
  LeaveBalanceUpdatedEvent,
  LeaveEscalatedEvent,
)
export class LeaveIntegrationEventHandler
  implements
    IEventHandler<LeaveAppliedEvent>,
    IEventHandler<LeaveApprovedEvent>,
    IEventHandler<LeaveRejectedEvent>,
    IEventHandler<LeaveCancelledEvent>,
    IEventHandler<LeaveBalanceUpdatedEvent>,
    IEventHandler<LeaveEscalatedEvent>
{
  private readonly logger = new Logger(LeaveIntegrationEventHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audit.queue') private readonly auditQueue: Queue,
    @InjectQueue('notification.queue')
    private readonly notificationQueue: Queue,
    @InjectQueue('document.queue') private readonly documentQueue: Queue,
  ) {}

  async handle(event: any) {
    this.logger.log(
      `[LeaveIntegrationEventHandler] Handling event: ${event.constructor.name}`,
    );

    try {
      const leaveRequestId = event.leaveRequestId;
      const leaveRequest = await this.prisma.leaveRequest.findUnique({
        where: { id: leaveRequestId },
        include: { employee: true },
      });

      if (!leaveRequest) {
        this.logger.warn(
          `LeaveRequest ${leaveRequestId} not found for event ${event.constructor.name}`,
        );
        return;
      }

      const businessId = leaveRequest.businessId;
      const employeeId = leaveRequest.employeeId;
      const profileId = leaveRequest.employee.profileId;
      const companyId = event.companyId;
      const performedBy = event.performedBy;
      const correlationId = `${leaveRequestId}-${event.constructor.name}-${Date.now()}`;

      // 1. Handle LeaveAppliedEvent
      if (event instanceof LeaveAppliedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'LeaveRequest',
          entityBusinessId: businessId,
          action: 'LEAVE_APPLIED',
          performedBy,
          afterState: { status: 'PENDING', leaveTypeId: event.leaveTypeId },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Leave Request Submitted',
          message: `A new leave request (${businessId}) has been submitted and is awaiting approval.`,
          notificationType: 'LEAVE_UPDATE',
          priority: 'NORMAL',
          recipient: employeeId,
        });
      }

      // 2. Handle LeaveApprovedEvent
      if (event instanceof LeaveApprovedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'LeaveRequest',
          entityBusinessId: businessId,
          action: 'LEAVE_APPROVED',
          performedBy,
          afterState: { status: 'APPROVED' },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Leave Approved',
          message: `Your leave request (${businessId}) has been approved.`,
          notificationType: 'LEAVE_UPDATE',
          priority: 'HIGH',
          recipient: employeeId,
        });

        await this.generateDocument(
          'Leave Approval Letter',
          companyId,
          profileId,
          employeeId,
          performedBy,
        );
      }

      // 3. Handle LeaveRejectedEvent
      if (event instanceof LeaveRejectedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'LeaveRequest',
          entityBusinessId: businessId,
          action: 'LEAVE_REJECTED',
          performedBy,
          afterState: { status: 'REJECTED', reason: event.reason },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Leave Rejected',
          message: `Your leave request (${businessId}) was rejected. Reason: ${event.reason}`,
          notificationType: 'LEAVE_UPDATE',
          priority: 'HIGH',
          recipient: employeeId,
        });

        await this.generateDocument(
          'Leave Rejection Letter',
          companyId,
          profileId,
          employeeId,
          performedBy,
        );
      }

      // 4. Handle LeaveCancelledEvent
      if (event instanceof LeaveCancelledEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'LeaveRequest',
          entityBusinessId: businessId,
          action: 'LEAVE_CANCELLED',
          performedBy,
          afterState: { status: 'CANCELLED' },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Leave Cancelled',
          message: `Your leave request (${businessId}) has been cancelled.`,
          notificationType: 'LEAVE_UPDATE',
          priority: 'NORMAL',
          recipient: employeeId,
        });

        await this.generateDocument(
          'Leave Cancellation Letter',
          companyId,
          profileId,
          employeeId,
          performedBy,
        );
      }

      // 5. Handle LeaveEscalatedEvent
      if (event instanceof LeaveEscalatedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'LeaveRequest',
          entityBusinessId: businessId,
          action: 'LEAVE_ESCALATED',
          performedBy,
          afterState: { status: 'ESCALATED' },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Leave Escalated',
          message: `Leave request (${businessId}) has been escalated.`,
          notificationType: 'LEAVE_UPDATE',
          priority: 'HIGH',
          recipient: employeeId,
        });
      }

      // 6. Handle LeaveBalanceUpdatedEvent
      if (event instanceof LeaveBalanceUpdatedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'LeaveBalance',
          entityBusinessId: `${employeeId}-${event.leaveTypeId}`, // Pseudo business ID
          action: 'LEAVE_BALANCE_UPDATED',
          performedBy,
          afterState: { employeeId, leaveTypeId: event.leaveTypeId },
          correlationId,
        });
      }
    } catch (error: any) {
      this.logger.error(
        `Error handling leave integration event: ${error.message}`,
        error.stack,
      );
    }
  }

  private async generateDocument(
    templateName: string,
    companyId: string,
    profileId: string | null,
    employeeId: string,
    performedBy: string,
  ) {
    if (!profileId) return;

    // Look up template by name
    const template = await this.prisma.template.findFirst({
      where: { name: templateName, companyId, isDeleted: false },
    });

    if (!template) {
      this.logger.warn(
        `Template '${templateName}' not found. Skipping document generation.`,
      );
      return;
    }

    await this.documentQueue.add('generate-document', {
      companyId,
      profileId,
      templateId: template.id,
      performedBy,
      employeeId,
    });
    this.logger.log(
      `Enqueued document generation for template: ${templateName}`,
    );
  }
}
