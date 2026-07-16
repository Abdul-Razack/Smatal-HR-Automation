import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import {
  EmployeeCreatedEvent,
  EmployeeUpdatedEvent,
  EmployeeStatusChangedEvent,
  EmployeeTerminatedEvent,
  EmployeeDeletedEvent,
  EmployeePromotedEvent,
  EmployeeTransferredEvent,
} from '../../domain/events/EmployeeEvents';
import { EmployeeStatus } from '../../domain/enums/EmployeeStatus';

@Injectable()
@EventsHandler(
  EmployeeCreatedEvent,
  EmployeeUpdatedEvent,
  EmployeeStatusChangedEvent,
  EmployeeTerminatedEvent,
  EmployeeDeletedEvent,
  EmployeePromotedEvent,
  EmployeeTransferredEvent,
)
export class EmployeeIntegrationEventHandler
  implements
    IEventHandler<EmployeeCreatedEvent>,
    IEventHandler<EmployeeUpdatedEvent>,
    IEventHandler<EmployeeStatusChangedEvent>,
    IEventHandler<EmployeeTerminatedEvent>,
    IEventHandler<EmployeeDeletedEvent>,
    IEventHandler<EmployeePromotedEvent>,
    IEventHandler<EmployeeTransferredEvent>
{
  private readonly logger = new Logger(EmployeeIntegrationEventHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audit.queue') private readonly auditQueue: Queue,
    @InjectQueue('notification.queue') private readonly notificationQueue: Queue,
    @InjectQueue('document.queue') private readonly documentQueue: Queue,
  ) {}

  async handle(event: any) {
    this.logger.log(
      `[EmployeeIntegrationEventHandler] Handling event: ${event.constructor.name}`,
    );

    try {
      const employeeId = event.employeeId;
      const employee = await this.prisma.employee.findUnique({
        where: { id: employeeId },
      });

      if (!employee) {
        this.logger.warn(
          `Employee ${employeeId} not found for event ${event.constructor.name}`,
        );
        return;
      }

      const businessId = employee.businessId;
      const profileId = employee.profileId;
      const companyId = event.companyId;
      const performedBy = event.performedBy;
      const correlationId = `${employeeId}-${event.constructor.name}-${Date.now()}`;

      // 1. Handle EmployeeCreatedEvent
      if (event instanceof EmployeeCreatedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'Employee',
          entityBusinessId: businessId,
          action: 'EMPLOYEE_CREATED',
          performedBy,
          afterState: { status: 'PENDING' },
          correlationId,
        });
        
        await this.generateDocument('Appointment Letter', companyId, profileId, employeeId, performedBy);
      }

      // 2. Handle EmployeeUpdatedEvent
      if (event instanceof EmployeeUpdatedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'Employee',
          entityBusinessId: businessId,
          action: 'EMPLOYEE_UPDATED',
          performedBy,
          afterState: {}, // specific updates handled by history and other events
          correlationId,
        });
      }

      // 3. Handle EmployeeStatusChangedEvent
      if (event instanceof EmployeeStatusChangedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'Employee',
          entityBusinessId: businessId,
          action: `EMPLOYEE_STATUS_${event.newStatus}`,
          performedBy,
          afterState: { status: event.newStatus },
          correlationId,
        });

        if (event.newStatus === EmployeeStatus.ACTIVE) {
          await this.notificationQueue.add('notify-action', {
            companyId,
            title: 'Employee Activated',
            message: `Employee ${businessId} is now active.`,
            notificationType: 'EMPLOYEE_UPDATE',
            priority: 'NORMAL',
            recipient: employeeId,
          });

          await this.generateDocument('Confirmation Letter', companyId, profileId, employeeId, performedBy);
        }
      }

      // 4. Handle EmployeeTerminatedEvent
      if (event instanceof EmployeeTerminatedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'Employee',
          entityBusinessId: businessId,
          action: 'EMPLOYEE_TERMINATED',
          performedBy,
          afterState: { terminationDate: event.terminationDate, reason: event.reason },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Employee Terminated',
          message: `Employee ${businessId} has been terminated.`,
          notificationType: 'EMPLOYEE_UPDATE',
          priority: 'HIGH',
          recipient: employeeId,
        });
        
        await this.generateDocument('Termination Letter', companyId, profileId, employeeId, performedBy);
      }

      // 5. Handle EmployeeDeletedEvent
      if (event instanceof EmployeeDeletedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'Employee',
          entityBusinessId: businessId,
          action: 'EMPLOYEE_DELETED',
          performedBy,
          afterState: { isDeleted: true },
          correlationId,
        });
      }

      // 6. Handle EmployeePromotedEvent
      if (event instanceof EmployeePromotedEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'Employee',
          entityBusinessId: businessId,
          action: 'EMPLOYEE_PROMOTED',
          performedBy,
          afterState: { designationId: event.newDesignationId },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Employee Promoted',
          message: `Employee ${businessId} has been promoted.`,
          notificationType: 'EMPLOYEE_UPDATE',
          priority: 'NORMAL',
          recipient: employeeId,
        });

        await this.generateDocument('Promotion Letter', companyId, profileId, employeeId, performedBy);
      }

      // 7. Handle EmployeeTransferredEvent
      if (event instanceof EmployeeTransferredEvent) {
        await this.auditQueue.add('log-action', {
          companyId,
          entityType: 'Employee',
          entityBusinessId: businessId,
          action: 'EMPLOYEE_TRANSFERRED',
          performedBy,
          afterState: { departmentId: event.newDepartmentId, branchId: event.newBranchId },
          correlationId,
        });

        await this.notificationQueue.add('notify-action', {
          companyId,
          title: 'Employee Transferred',
          message: `Employee ${businessId} has been transferred.`,
          notificationType: 'EMPLOYEE_UPDATE',
          priority: 'NORMAL',
          recipient: employeeId,
        });

        await this.generateDocument('Transfer Letter', companyId, profileId, employeeId, performedBy);
      }

    } catch (error: any) {
      this.logger.error(
        `Error handling employee integration event: ${error.message}`,
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

    const template = await this.prisma.template.findFirst({
      where: { name: templateName, companyId, isDeleted: false },
    });

    if (!template) {
      this.logger.warn(
        `Template '${templateName}' not found. Skipping document generation for Employee ${employeeId}.`,
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
    this.logger.log(`Enqueued document generation for template: ${templateName}`);
  }
}
