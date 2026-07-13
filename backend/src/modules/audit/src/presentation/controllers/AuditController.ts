import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  Param,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAuditLogCommand } from '../../application/commands/CreateAuditLog/CreateAuditLogCommand';
import { GetAuditHistoryQuery } from '../../application/queries/GetAuditHistory/GetAuditHistoryQuery';
import { AuditAction } from '../../domain/enums/AuditAction';

@Controller('audit')
export class AuditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createAuditLog(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
  ) {
    const result = await this.commandBus.execute(
      new CreateAuditLogCommand(
        companyId,
        body.entityType,
        body.entityBusinessId,
        body.action as AuditAction,
        userId,
        body.beforeState,
        body.afterState,
        body.ipAddress,
        body.correlationId,
        body.remarks,
      ),
    );

    if (result.isFailure) throw new Error(result.error);
    return { id: result.getValue() };
  }

  @Get()
  async getAuditHistory(
    @Headers('x-company-id') companyId: string,
    @Query('entityBusinessId') entityBusinessId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.queryBus.execute(
      new GetAuditHistoryQuery(
        companyId,
        entityBusinessId,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      ),
    );

    if (result.isFailure) throw new Error(result.error);
    return result.getValue();
  }
}
