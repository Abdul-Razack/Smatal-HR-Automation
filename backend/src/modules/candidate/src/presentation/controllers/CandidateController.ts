import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateCandidateRequest,
  UpdateCandidateRequest,
  RejectCandidateRequest,
  WithdrawCandidateRequest,
  ConvertCandidateRequest,
} from '../../application/dto/requests/CandidateRequests';
import { CreateCandidateCommand } from '../../application/commands/CreateCandidate/CreateCandidateCommand';
import { UpdateCandidateCommand } from '../../application/commands/UpdateCandidate/UpdateCandidateCommand';
import { SubmitCandidateCommand } from '../../application/commands/SubmitCandidate/SubmitCandidateCommand';
import { ScreenCandidateCommand } from '../../application/commands/ScreenCandidate/ScreenCandidateCommand';
import { SelectCandidateCommand } from '../../application/commands/SelectCandidate/SelectCandidateCommand';
import { RejectCandidateCommand } from '../../application/commands/RejectCandidate/RejectCandidateCommand';
import { WithdrawCandidateCommand } from '../../application/commands/WithdrawCandidate/WithdrawCandidateCommand';
import { DeleteCandidateCommand } from '../../application/commands/DeleteCandidate/DeleteCandidateCommand';
import { ConvertCandidateCommand } from '../../application/commands/ConvertCandidate/ConvertCandidateCommand';
import { GetCandidateQuery } from '../../application/queries/GetCandidate/GetCandidateQuery';
import { ListCandidatesQuery } from '../../application/queries/ListCandidates/ListCandidatesQuery';
import { CandidateStatus } from '../../domain/enums/CandidateStatus';
import { Result } from '../../../../../kernel/result/Result';

@ApiTags('Candidates')
@Controller('candidates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CandidateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ─── Create ──────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created' })
  async create(@Request() req: any, @Body() dto: CreateCandidateRequest) {
    const result: Result<string> = await this.commandBus.execute(
      new CreateCandidateCommand(
        req.user.companyId,
        dto.profileId,
        req.user.userId,
        dto.source,
        dto.referredBy,
        dto.notes,
        dto.appliedDate ? new Date(dto.appliedDate) : null,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { id: result.getValue() };
  }

  // ─── List ────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List candidates for the authenticated company' })
  @ApiQuery({ name: 'status', enum: CandidateStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @Request() req: any,
    @Query('status') status?: CandidateStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new ListCandidatesQuery(req.user.companyId, status, +page, +limit),
    );
  }

  // ─── Get ─────────────────────────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a candidate by ID' })
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetCandidateQuery(id, req.user.companyId));
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  @Patch(':id')
  @ApiOperation({ summary: 'Update candidate details' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCandidateRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new UpdateCandidateCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.notes,
        dto.source,
        dto.referredBy,
        dto.appliedDate ? new Date(dto.appliedDate) : undefined,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  // ─── Lifecycle Transitions ────────────────────────────────────────────────

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit candidate for review (DRAFT → APPLIED)' })
  async submit(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new SubmitCandidateCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/screen')
  @ApiOperation({
    summary: 'Move candidate to screening (APPLIED → SCREENING)',
  })
  async screen(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new ScreenCandidateCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/select')
  @ApiOperation({ summary: 'Select candidate (INTERVIEWING → SELECTED)' })
  async select(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new SelectCandidateCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject candidate' })
  async reject(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectCandidateRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new RejectCandidateCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.reason,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw candidate application' })
  async withdraw(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WithdrawCandidateRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new WithdrawCandidateCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.reason,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert selected candidate to employee' })
  async convert(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConvertCandidateRequest,
  ) {
    const result: Result<{ employeeId: string; employeeBusinessId: string }> =
      await this.commandBus.execute(
        new ConvertCandidateCommand(
          id,
          req.user.companyId,
          req.user.userId,
          new Date(dto.joinedDate),
          dto.departmentId,
          dto.designationId,
          dto.branchId,
          dto.reportsToId,
          dto.employeeNumber,
          dto.probationEndDate ? new Date(dto.probationEndDate) : null,
        ),
      );
    if (result.isFailure) return { error: result.errorValue };
    return result.getValue();
  }

  // ─── Delete ──────────────────────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a candidate' })
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new DeleteCandidateCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) return { error: result.errorValue };
  }
}
