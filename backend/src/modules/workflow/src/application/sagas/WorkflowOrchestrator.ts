import { Injectable, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WorkflowStageAdvancedEvent } from '../../domain/events/WorkflowEvents';

@EventsHandler(WorkflowStageAdvancedEvent)
@Injectable()
export class WorkflowOrchestrator implements IEventHandler<WorkflowStageAdvancedEvent> {
  private readonly logger = new Logger(WorkflowOrchestrator.name);

  constructor(
    @InjectQueue('document.queue') private readonly documentQueue: Queue,
    @InjectQueue('notification.queue')
    private readonly notificationQueue: Queue,
    @InjectQueue('audit.queue') private readonly auditQueue: Queue,
  ) {}

  async handle(event: WorkflowStageAdvancedEvent) {
    this.logger.log(
      `[WorkflowOrchestrator] Handling WorkflowStageAdvancedEvent for instance ${event.instanceId}`,
    );

    const correlationId = `${event.instanceId}-${event.newStageId}-${Date.now()}`;

    // 1. Fire and Forget Audit
    await this.auditQueue.add('log-stage-advanced', {
      companyId: event.companyId,
      entityType: 'WorkflowInstance',
      entityBusinessId: event.instanceId,
      action: 'STAGE_ADVANCED',
      performedBy: event.performedBy,
      afterState: {
        stageId: event.newStageId,
        action: event.action,
        remarks: event.remarks,
      },
      correlationId,
    });

    // 2. Dispatch Notification Job
    await this.notificationQueue.add('notify-stage-advanced', {
      companyId: event.companyId,
      title: 'Workflow Stage Advanced',
      message: `Workflow has advanced to a new stage.`,
      notificationType: 'WORKFLOW_UPDATE',
      priority: 'HIGH',
      recipient: event.performedBy, // Should ideally be assigned user, but using performedBy for mock
    });

    // 3. Document Generation
    // Normally, we'd check if the new stage requires document generation.
    // For this mock, we can emit a generate job. Let's assume stageId provides a trigger.
    this.logger.debug(
      `[WorkflowOrchestrator] Checking for document generation triggers on stage ${event.newStageId}`,
    );

    // Check if new stage is "offer stage" or similar based on some configuration
    // Here we'll dispatch a generic document generation job if a certain condition is met.
    // Since we don't have the config table built, we'll leave the enqueue call ready to be triggered.

    /*
    await this.documentQueue.add('generate-document', {
      companyId: event.companyId,
      workflowInstanceId: event.instanceId,
      stageId: event.newStageId,
      correlationId,
    });
    */
  }
}
