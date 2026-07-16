import { Injectable, Logger } from '@nestjs/common';
import { IGenerationDispatcher, DispatchResult } from './IGenerationDispatcher';
import { GenerationOrchestrator } from '../services/GenerationOrchestrator';

@Injectable()
export class ImmediateDispatcher implements IGenerationDispatcher {
  private readonly logger = new Logger(ImmediateDispatcher.name);

  constructor(private readonly orchestrator: GenerationOrchestrator) {}

  async dispatch(jobPayload: any): Promise<DispatchResult> {
    this.logger.log(`Dispatching generation job immediately...`);

    // In Immediate execution, we await the orchestrator.
    // jobPayload should contain the resolved aggregates and context.
    await this.orchestrator.execute(
      jobPayload.document,
      jobPayload.template,
      jobPayload.activeVersion,
      jobPayload.context,
      jobPayload.performedBy,
    );

    return {
      jobId: 'sync-job',
      status: 'COMPLETED',
    };
  }
}
