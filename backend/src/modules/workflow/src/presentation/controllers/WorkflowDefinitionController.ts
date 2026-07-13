import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
  CreateWorkflowDefinitionRequest,
  UpdateWorkflowDefinitionRequest,
  AddWorkflowStageRequest,
} from '../../application/dto/requests/WorkflowRequests';
import { CreateWorkflowDefinitionCommand } from '../../application/commands/CreateWorkflowDefinition/CreateWorkflowDefinitionCommand';
import { UpdateWorkflowDefinitionCommand } from '../../application/commands/UpdateWorkflowDefinition/UpdateWorkflowDefinitionCommand';
import { PublishWorkflowDefinitionCommand } from '../../application/commands/PublishWorkflowDefinition/PublishWorkflowDefinitionCommand';
import { ArchiveWorkflowDefinitionCommand } from '../../application/commands/ArchiveWorkflowDefinition/ArchiveWorkflowDefinitionCommand';
import { AddWorkflowStageCommand } from '../../application/commands/AddWorkflowStage/AddWorkflowStageCommand';
import { RemoveWorkflowStageCommand } from '../../application/commands/RemoveWorkflowStage/RemoveWorkflowStageCommand';
import { GetWorkflowDefinitionQuery } from '../../application/queries/GetWorkflowDefinition/GetWorkflowDefinitionQuery';
import { ListWorkflowDefinitionsQuery } from '../../application/queries/ListWorkflowDefinitions/ListWorkflowDefinitionsQuery';
import { WorkflowStatus } from '../../domain/enums/WorkflowEnums';
import { Result } from '../../../../../kernel/result/Result';

@ApiTags('Workflow Definitions')
@Controller('workflow-definitions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkflowDefinitionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workflow definition (DRAFT)' })
  async create(
    @Request() req: any,
    @Body() dto: CreateWorkflowDefinitionRequest,
  ) {
    const result: Result<string> = await this.commandBus.execute(
      new CreateWorkflowDefinitionCommand(
        req.user.companyId,
        req.user.userId,
        dto.name,
        dto.entityType,
        dto.description,
        dto.processCode,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { id: result.getValue() };
  }

  @Get()
  @ApiOperation({ summary: 'List workflow definitions' })
  @ApiQuery({ name: 'status', enum: WorkflowStatus, required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @Request() req: any,
    @Query('status') status?: WorkflowStatus,
    @Query('entityType') entityType?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new ListWorkflowDefinitionsQuery(
        req.user.companyId,
        status,
        entityType,
        +page,
        +limit,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow definition by ID' })
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(
      new GetWorkflowDefinitionQuery(id, req.user.companyId),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow definition name/description' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkflowDefinitionRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new UpdateWorkflowDefinitionCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.name,
        dto.description,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish (activate) a workflow definition' })
  async publish(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new PublishWorkflowDefinitionCommand(
        id,
        req.user.companyId,
        req.user.userId,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a workflow definition' })
  async archive(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new ArchiveWorkflowDefinitionCommand(
        id,
        req.user.companyId,
        req.user.userId,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/stages')
  @ApiOperation({ summary: 'Add a stage to a workflow definition' })
  async addStage(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddWorkflowStageRequest,
  ) {
    const result: Result<string> = await this.commandBus.execute(
      new AddWorkflowStageCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.name,
        dto.code,
        dto.displayOrder,
        dto.description,
        dto.isTerminal ?? false,
        dto.isFinal ?? false,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { stageId: result.getValue() };
  }

  @Delete(':id/stages/:stageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a stage from a workflow definition' })
  async removeStage(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new RemoveWorkflowStageCommand(
        id,
        stageId,
        req.user.companyId,
        req.user.userId,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
  }
}
