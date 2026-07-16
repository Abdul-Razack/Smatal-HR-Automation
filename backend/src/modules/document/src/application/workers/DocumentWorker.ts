import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GenerateDocumentCommand } from '../commands/GenerateDocument/GenerateDocumentCommand';

@Processor('document.queue')
@Injectable()
export class DocumentWorker extends WorkerHost {
  private readonly logger = new Logger(DocumentWorker.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log(`Processing document generation job ${job.id}`);

    try {
      const {
        companyId,
        profileId,
        templateId,
        performedBy,
        candidateId,
        employeeId,
        workflowInstanceId,
        workflowStageId,
      } = job.data;

      await this.commandBus.execute(
        new GenerateDocumentCommand(
          companyId,
          profileId,
          templateId,
          performedBy,
          candidateId,
          employeeId,
          workflowInstanceId,
          workflowStageId,
        ),
      );

      this.logger.log(
        `Successfully processed document generation job ${job.id}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to process document generation job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
