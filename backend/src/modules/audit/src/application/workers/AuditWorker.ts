import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { CreateAuditLogCommand } from '../commands/CreateAuditLog/CreateAuditLogCommand';

@Processor('audit.queue')
@Injectable()
export class AuditWorker extends WorkerHost {
  private readonly logger = new Logger(AuditWorker.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.debug(`Processing audit log job ${job.id}`);

    try {
      const {
        companyId,
        entityType,
        entityBusinessId,
        action,
        performedBy,
        beforeState,
        afterState,
        correlationId,
        ipAddress,
        remarks,
      } = job.data;

      await this.commandBus.execute(
        new CreateAuditLogCommand(
          companyId,
          entityType,
          entityBusinessId,
          action,
          performedBy,
          beforeState,
          afterState,
          ipAddress,
          correlationId,
          remarks,
        ),
      );

      this.logger.debug(`Successfully processed audit log job ${job.id}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to process audit log job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
