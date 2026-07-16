import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import {
  CandidateCreatedEvent,
  CandidateUpdatedEvent,
  CandidateStatusChangedEvent,
  CandidateConvertedEvent,
  CandidateDeletedEvent,
  InterviewScheduledEvent,
  InterviewCancelledEvent,
  InterviewCompletedEvent,
  OfferGeneratedEvent,
  OfferAcceptedEvent,
  OfferRejectedEvent,
} from '../../domain/events/CandidateEvents';
import { CandidateStatus } from '../../domain/enums/CandidateStatus';

@Injectable()
@EventsHandler(
  CandidateCreatedEvent,
  CandidateUpdatedEvent,
  CandidateStatusChangedEvent,
  CandidateConvertedEvent,
  CandidateDeletedEvent,
  InterviewScheduledEvent,
  InterviewCancelledEvent,
  InterviewCompletedEvent,
  OfferGeneratedEvent,
  OfferAcceptedEvent,
  OfferRejectedEvent,
)
export class CandidateIntegrationEventHandler
  implements
    IEventHandler<CandidateCreatedEvent>,
    IEventHandler<CandidateUpdatedEvent>,
    IEventHandler<CandidateStatusChangedEvent>,
    IEventHandler<CandidateConvertedEvent>,
    IEventHandler<CandidateDeletedEvent>,
    IEventHandler<InterviewScheduledEvent>,
    IEventHandler<InterviewCancelledEvent>,
    IEventHandler<InterviewCompletedEvent>,
    IEventHandler<OfferGeneratedEvent>,
    IEventHandler<OfferAcceptedEvent>,
    IEventHandler<OfferRejectedEvent>
{
  private readonly logger = new Logger(CandidateIntegrationEventHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('audit.queue') private readonly auditQueue: Queue,
    @InjectQueue('notification.queue') private readonly notificationQueue: Queue,
    @InjectQueue('document.queue') private readonly documentQueue: Queue,
  ) {}

  async handle(event: any) {
    this.logger.log(
      `[CandidateIntegrationEventHandler] Handling: ${event.constructor.name}`,
    );

    try {
      await this.routeEvent(event);
    } catch (error: any) {
      this.logger.error(
        `Error handling candidate integration event: ${error.message}`,
        error.stack,
      );
    }
  }

  private async routeEvent(event: any): Promise<void> {
    // ── Candidate Events ──────────────────────────────────────────────────────

    if (event instanceof CandidateCreatedEvent) {
      await this.audit(event.companyId, 'Candidate', event.businessId, 'CANDIDATE_CREATED', event.performedBy, {
        profileId: event.profileId,
      });
      return;
    }

    if (event instanceof CandidateUpdatedEvent) {
      await this.audit(event.companyId, 'Candidate', event.candidateId, 'CANDIDATE_UPDATED', event.performedBy, {});
      return;
    }

    if (event instanceof CandidateStatusChangedEvent) {
      await this.audit(event.companyId, 'Candidate', event.candidateId, `CANDIDATE_STATUS_${event.newStatus}`, event.performedBy, {
        previousStatus: event.previousStatus,
        newStatus: event.newStatus,
      });

      if (event.newStatus === CandidateStatus.SELECTED) {
        await this.notify(event.companyId, 'Candidate Selected', `Candidate ${event.candidateId} has been selected for an offer.`, 'CANDIDATE_UPDATE', 'HIGH', event.candidateId);
      } else if (event.newStatus === CandidateStatus.REJECTED) {
        await this.notify(event.companyId, 'Candidate Rejected', `Candidate ${event.candidateId} has been rejected.`, 'CANDIDATE_UPDATE', 'NORMAL', event.candidateId);
        await this.generateDocumentByCandidateId(event.candidateId, event.companyId, 'Rejection Letter', event.performedBy);
      } else if (event.newStatus === CandidateStatus.CONVERTED) {
        await this.notify(event.companyId, 'Candidate Hired', `Candidate ${event.candidateId} has been converted to an employee.`, 'CANDIDATE_UPDATE', 'HIGH', event.candidateId);
      }
      return;
    }

    if (event instanceof CandidateConvertedEvent) {
      await this.audit(event.companyId, 'Candidate', event.candidateId, 'CANDIDATE_CONVERTED', event.performedBy, {
        employeeId: event.employeeId,
      });
      return;
    }

    if (event instanceof CandidateDeletedEvent) {
      await this.audit(event.companyId, 'Candidate', event.candidateId, 'CANDIDATE_DELETED', event.performedBy, { isDeleted: true });
      return;
    }

    // ── Interview Events ──────────────────────────────────────────────────────

    if (event instanceof InterviewScheduledEvent) {
      await this.audit(event.companyId, 'Interview', event.interviewId, 'INTERVIEW_SCHEDULED', event.performedBy, {
        candidateId: event.candidateId,
        title: event.title,
        scheduledAt: event.scheduledAt,
      });
      await this.notify(event.companyId, 'Interview Scheduled', `Interview "${event.title}" has been scheduled.`, 'CANDIDATE_UPDATE', 'NORMAL', event.candidateId);
      await this.generateDocumentByCandidateId(event.candidateId, event.companyId, 'Interview Invitation', event.performedBy);
      return;
    }

    if (event instanceof InterviewCancelledEvent) {
      await this.audit(event.companyId, 'Interview', event.interviewId, 'INTERVIEW_CANCELLED', event.performedBy, {
        candidateId: event.candidateId,
      });
      await this.notify(event.companyId, 'Interview Cancelled', `An interview for candidate ${event.candidateId} has been cancelled.`, 'CANDIDATE_UPDATE', 'HIGH', event.candidateId);
      return;
    }

    if (event instanceof InterviewCompletedEvent) {
      await this.audit(event.companyId, 'Interview', event.interviewId, 'INTERVIEW_FEEDBACK_SUBMITTED', event.performedBy, {
        candidateId: event.candidateId,
      });
      return;
    }

    // ── Offer Events ──────────────────────────────────────────────────────────

    if (event instanceof OfferGeneratedEvent) {
      await this.audit(event.companyId, 'Offer', event.offerId, 'OFFER_GENERATED', event.performedBy, {
        candidateId: event.candidateId,
        businessId: event.businessId,
      });
      await this.notify(event.companyId, 'Offer Generated', `Offer ${event.businessId} has been generated for candidate ${event.candidateId}.`, 'CANDIDATE_UPDATE', 'HIGH', event.candidateId);
      await this.generateDocumentByCandidateId(event.candidateId, event.companyId, 'Offer Letter', event.performedBy, event.offerId);
      return;
    }

    if (event instanceof OfferAcceptedEvent) {
      await this.audit(event.companyId, 'Offer', event.offerId, 'OFFER_ACCEPTED', event.performedBy, {
        candidateId: event.candidateId,
      });
      await this.notify(event.companyId, 'Offer Accepted', `Candidate ${event.candidateId} accepted the offer.`, 'CANDIDATE_UPDATE', 'HIGH', event.candidateId);
      await this.generateDocumentByCandidateId(event.candidateId, event.companyId, 'Appointment Letter', event.performedBy);
      return;
    }

    if (event instanceof OfferRejectedEvent) {
      await this.audit(event.companyId, 'Offer', event.offerId, 'OFFER_REJECTED', event.performedBy, {
        candidateId: event.candidateId,
      });
      await this.notify(event.companyId, 'Offer Rejected', `Candidate ${event.candidateId} rejected the offer.`, 'CANDIDATE_UPDATE', 'HIGH', event.candidateId);
      return;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private async audit(
    companyId: string,
    entityType: string,
    entityBusinessId: string,
    action: string,
    performedBy: string,
    afterState: Record<string, any>,
  ) {
    const correlationId = `${entityBusinessId}-${action}-${Date.now()}`;
    await this.auditQueue.add('log-action', {
      companyId,
      entityType,
      entityBusinessId,
      action,
      performedBy,
      afterState,
      correlationId,
    });
    this.logger.log(`Enqueued audit: ${action} for ${entityType} ${entityBusinessId}`);
  }

  private async notify(
    companyId: string,
    title: string,
    message: string,
    notificationType: string,
    priority: string,
    recipient: string,
  ) {
    await this.notificationQueue.add('notify-action', {
      companyId,
      title,
      message,
      notificationType,
      priority,
      recipient,
    });
    this.logger.log(`Enqueued notification: ${title}`);
  }

  private async generateDocumentByCandidateId(
    candidateId: string,
    companyId: string,
    templateName: string,
    performedBy: string,
    offerId?: string,
  ) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate || !candidate.profileId) {
      this.logger.warn(`Candidate ${candidateId} not found or has no profile. Skipping document generation.`);
      return;
    }

    const template = await this.prisma.template.findFirst({
      where: { name: templateName, companyId, isDeleted: false },
    });

    if (!template) {
      this.logger.warn(`Template '${templateName}' not found. Skipping document generation.`);
      return;
    }

    await this.documentQueue.add('generate-document', {
      companyId,
      profileId: candidate.profileId,
      templateId: template.id,
      performedBy,
      candidateId,
      ...(offerId ? { offerId } : {}),
    });
    this.logger.log(`Enqueued document generation for template: ${templateName}`);
  }
}
