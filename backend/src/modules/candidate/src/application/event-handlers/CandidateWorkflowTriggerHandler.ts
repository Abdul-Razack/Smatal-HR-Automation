import {
  EventsHandler,
  IEventHandler,
  CommandBus,
} from '@nestjs/cqrs';
import { Logger, Inject } from '@nestjs/common';
import {
  InterviewScheduledEvent,
  OfferGeneratedEvent,
  OfferAcceptedEvent,
} from '../../domain/events/CandidateEvents';
import { StartWorkflowInstanceCommand } from '../../../../workflow/src/application/commands/StartWorkflowInstance/StartWorkflowInstanceCommand';
import { IWorkflowDefinitionRepository } from '../../../../workflow/src/domain/repositories/IWorkflowDefinitionRepository';
import { WorkflowStatus } from '../../../../workflow/src/domain/enums/WorkflowEnums';

/**
 * Handles Interview and Offer-level workflow triggers.
 *
 * Note: Candidate status-based workflow triggers (OFFER_LETTER, OFFER_ACCEPTANCE)
 * are handled by CandidateWorkflowTriggerHandler in the Workflow module itself
 * (LifecycleEventHandlers.ts). This handler supplements that by handling
 * Interview and Offer domain events only.
 */
@EventsHandler(
  InterviewScheduledEvent,
  OfferGeneratedEvent,
  OfferAcceptedEvent,
)
export class CandidateWorkflowTriggerHandler
  implements
    IEventHandler<InterviewScheduledEvent>,
    IEventHandler<OfferGeneratedEvent>,
    IEventHandler<OfferAcceptedEvent>
{
  private readonly logger = new Logger(CandidateWorkflowTriggerHandler.name);

  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,
    @Inject('IWorkflowDefinitionRepository')
    private readonly repo: IWorkflowDefinitionRepository,
  ) {}

  async handle(event: any) {
    let processCode: string | null = null;
    let entityId: string = '';
    let candidateId: string = '';

    if (event instanceof InterviewScheduledEvent) {
      processCode = 'INTERVIEW_APPROVAL';
      entityId = event.interviewId;
      candidateId = event.candidateId;
    } else if (event instanceof OfferGeneratedEvent) {
      processCode = 'OFFER_APPROVAL';
      entityId = event.offerId;
      candidateId = event.candidateId;
    } else if (event instanceof OfferAcceptedEvent) {
      processCode = 'HIRING_APPROVAL';
      entityId = event.offerId;
      candidateId = event.candidateId;
    }

    if (processCode) {
      await this.triggerWorkflow(processCode, event.companyId, entityId, candidateId, event.performedBy);
    }
  }

  private async triggerWorkflow(
    processCode: string,
    companyId: string,
    entityId: string,
    candidateId: string,
    performedBy: string,
  ) {
    try {
      const def = await this.repo.findByProcessCodeAndCompany(processCode, companyId);

      if (!def || def.status !== WorkflowStatus.ACTIVE) {
        this.logger.warn(
          `Workflow definition '${processCode}' not found or inactive for company ${companyId}. Skipping.`,
        );
        return;
      }

      await this.commandBus.execute(
        new StartWorkflowInstanceCommand(
          companyId,
          performedBy,
          def.id.toString(),
          'CANDIDATE',
          entityId,
          candidateId,
          undefined,
        ),
      );

      this.logger.log(
        `Triggered '${processCode}' workflow for entity ${entityId} (candidate: ${candidateId})`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to trigger workflow '${processCode}': ${error.message}`,
      );
    }
  }
}
