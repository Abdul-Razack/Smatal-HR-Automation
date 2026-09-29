import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { CreateAuditLogCommand } from '../../application/commands/CreateAuditLog/CreateAuditLogCommand';
import { GetAuditHistoryQuery } from '../../application/queries/GetAuditHistory/GetAuditHistoryQuery';
import { AuditAction } from '../../domain/enums/AuditAction';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an audit log record' })
  async createAuditLog(
    @Request() req: any,
    @Body() body: any,
  ) {
    const result = await this.commandBus.execute(
      new CreateAuditLogCommand(
        req.user.companyId,
        body.entityType,
        body.entityBusinessId,
        body.action as AuditAction,
        req.user.userId,
        body.beforeState,
        body.afterState,
        body.ipAddress,
        body.correlationId,
        body.remarks,
      ),
    );

    if (result.isFailure) throw new BadRequestException(result.error);
    return { id: result.getValue() };
  }

  @Get()
  @ApiOperation({ summary: 'Get audit history for authenticated tenant' })
  async getAuditHistory(
    @Request() req: any,
    @Query('entityBusinessId') entityBusinessId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const result = await this.queryBus.execute(
      new GetAuditHistoryQuery(
        req.user.companyId,
        entityBusinessId,
        limit ? Number(limit) : undefined,
        offset ? Number(offset) : undefined,
      ),
    );

    if (result.isFailure) throw new BadRequestException(result.error);
    return result.getValue();
  }
}
