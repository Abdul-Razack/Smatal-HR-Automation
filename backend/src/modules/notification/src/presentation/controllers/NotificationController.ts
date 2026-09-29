import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { MarkNotificationReadCommand } from '../../application/commands/MarkNotificationRead/MarkNotificationReadCommand';
import { GetNotificationsQuery } from '../../application/queries/GetNotifications/GetNotificationsQuery';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for authenticated user' })
  async getNotifications(
    @Request() req: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const isUnreadOnly = unreadOnly === 'true';
    const result = await this.queryBus.execute(
      new GetNotificationsQuery(
        req.user.companyId,
        req.user.userId,
        isUnreadOnly,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      ),
    );

    if (result.isFailure) throw new BadRequestException(result.error);
    return result.getValue();
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(
    @Request() req: any,
    @Param('id') notificationId: string,
  ) {
    const result = await this.commandBus.execute(
      new MarkNotificationReadCommand(
        req.user.companyId,
        notificationId,
        req.user.userId,
      ),
    );

    if (result.isFailure) throw new BadRequestException(result.error);
    return { success: true };
  }
}
