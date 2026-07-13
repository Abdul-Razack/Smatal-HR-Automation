import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import {
  StartWorkflowInstanceRequest,
  AdvanceWorkflowStageRequest,
  ApproveWorkflowStageRequest,
  RejectWorkflowStageRequest,
  ReturnWorkflowStageRequest,
  CancelWorkflowInstanceRequest,
} from '../../application/dto/requests/WorkflowRequests';
import { StartWorkflowInstanceCommand } from '../../application/commands/StartWorkflowInstance/StartWorkflowInstanceCommand';
import { AdvanceWorkflowStageCommand } from '../../application/commands/AdvanceWorkflowStage/AdvanceWorkflowStageCommand';
import { ApproveWorkflowStageCommand } from '../../application/commands/ApproveWorkflowStage/ApproveWorkflowStageCommand';
import { RejectWorkflowStageCommand } from '../../application/commands/RejectWorkflowStage/RejectWorkflowStageCommand';
import { ReturnWorkflowStageCommand } from '../../application/commands/ReturnWorkflowStage/ReturnWorkflowStageCommand';
import { CancelWorkflowInstanceCommand } from '../../application/commands/CancelWorkflowInstance/CancelWorkflowInstanceCommand';
import { GetWorkflowInstanceQuery } from '../../application/queries/GetWorkflowInstance/GetWorkflowInstanceQuery';
import { ListWorkflowInstancesQuery } from '../../application/queries/ListWorkflowInstances/ListWorkflowInstancesQuery';
import { GetWorkflowHistoryQuery } from '../../application/queries/GetWorkflowHistory/GetWorkflowHistoryQuery';
import { WorkflowInstanceStatus } from '../../domain/enums/WorkflowEnums';
import { Result } from '../../../../../kernel/result/Result';

@ApiTags('Workflow Instances')
@Controller('workflow-instances')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowInstanceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Start a new workflow instance' })
  async start(@Request() req: any, @Body() dto: StartWorkflowInstanceRequest) {
    const result: Result<string> = await this.commandBus.execute(
      new StartWorkflowInstanceCommand(
        req.user.companyId,
        req.user.userId,
        dto.workflowDefinitionId,
        dto.entityType,
        dto.entityId,
        dto.candidateId,
        dto.employeeId,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { id: result.getValue() };
  }

  @Get()
  @ApiOperation({ summary: 'List workflow instances' })
  @ApiQuery({ name: 'status', enum: WorkflowInstanceStatus, required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @Request() req: any,
    @Query('status') status?: WorkflowInstanceStatus,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new ListWorkflowInstancesQuery(
        req.user.companyId,
        status,
        entityType,
        entityId,
        +page,
        +limit,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow instance by ID' })
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(
      new GetWorkflowInstanceQuery(id, req.user.companyId),
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get execution history of a workflow instance' })
  async getHistory(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(
      new GetWorkflowHistoryQuery(id, req.user.companyId),
    );
  }

  @Post(':id/advance')
  @ApiOperation({ summary: 'Advance to specific next stage' })
  async advance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdvanceWorkflowStageRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new AdvanceWorkflowStageCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.nextStageId,
        dto.remarks,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/approve')
  @ApiOperation({
    summary: 'Approve current stage (auto-advances or completes)',
  })
  async approve(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveWorkflowStageRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new ApproveWorkflowStageCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.remarks,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject current stage (marks instance as FAILED)' })
  async reject(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectWorkflowStageRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new RejectWorkflowStageCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.reason,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Return to a previous stage' })
  async returnToStage(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReturnWorkflowStageRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new ReturnWorkflowStageCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.targetStageId,
        dto.reason,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a workflow instance' })
  async cancel(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelWorkflowInstanceRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new CancelWorkflowInstanceCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.reason,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }
}
