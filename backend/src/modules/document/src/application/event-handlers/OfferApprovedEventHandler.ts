import { EventsHandler, IEventHandler, CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { OfferApprovedEvent } from '../../../../candidate/src/domain/events/OfferApprovedEvent';
import { GenerateDocumentCommand } from '../commands/GenerateDocument/GenerateDocumentCommand';

@EventsHandler(OfferApprovedEvent)
export class OfferApprovedEventHandler implements IEventHandler<OfferApprovedEvent> {
  private readonly logger = new Logger(OfferApprovedEventHandler.name);

  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: OfferApprovedEvent) {
    this.logger.log(`Received OfferApprovedEvent for candidate: ${event.candidateId}`);

    // The Event Bus pushes the event to this orchestrator.
    // The orchestrator maps the Domain Event into a Document Service Command.
    const command = new GenerateDocumentCommand(
      event.companyId,
      event.documentTypeId,
      'CANDIDATE',
      event.candidateId,
      {
        actionId: event.offerId,
        initiatedBy: event.performedBy,
        effectiveDate: new Date(),
      },
      event.performedBy,
    );

    // Dispatch to the Document Service to queue the generation
    await this.commandBus.execute(command);
    
    this.logger.log(`Dispatched GenerateDocumentCommand for candidate: ${event.candidateId}`);
  }
}
