import { Controller, Get, Post, Headers, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MarkNotificationReadCommand } from '../../application/commands/MarkNotificationRead/MarkNotificationReadCommand';
import { GetNotificationsQuery } from '../../application/queries/GetNotifications/GetNotificationsQuery';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getNotifications(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const isUnreadOnly = unreadOnly === 'true';
    const result = await this.queryBus.execute(
      new GetNotificationsQuery(
        companyId,
        userId,
        isUnreadOnly,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      ),
    );

    if (result.isFailure) throw new Error(result.error);
    return result.getValue();
  }

  @Post(':id/read')
  async markAsRead(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') notificationId: string,
  ) {
    const result = await this.commandBus.execute(
      new MarkNotificationReadCommand(companyId, notificationId, userId),
    );

    if (result.isFailure) throw new Error(result.error);
    return { success: true };
  }
}
