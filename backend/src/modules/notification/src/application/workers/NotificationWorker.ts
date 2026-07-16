import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { CreateNotificationCommand } from '../commands/CreateNotification/CreateNotificationCommand';

@Processor('notification.queue')
@Injectable()
export class NotificationWorker extends WorkerHost {
  private readonly logger = new Logger(NotificationWorker.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.debug(`Processing notification job ${job.id}`);

    try {
      const {
        companyId,
        title,
        message,
        notificationType,
        priority,
        recipient,
        email, // For external email provider abstraction
      } = job.data;

      // 1. Create In-App Notification (Database)
      await this.commandBus.execute(
        new CreateNotificationCommand(
          companyId,
          title,
          message,
          notificationType,
          priority,
          recipient,
        ),
      );

      // 2. Mock Email Abstraction
      if (email) {
        this.logger.log(
          `[MOCK EMAIL API] Sent email to ${email} with subject: ${title}`,
        );
      }

      this.logger.debug(`Successfully processed notification job ${job.id}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to process notification job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
