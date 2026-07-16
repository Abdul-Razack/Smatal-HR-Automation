import {
  Controller,
  Get,
  Post,
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
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  ApplyLeaveRequestDto,
  UpdateLeaveRequestDto,
  CancelLeaveRequestDto,
  ListLeavesQueryDto,
} from '../../application/dto/requests/LeaveRequests';

import { ApplyLeaveCommand } from '../../application/commands/ApplyLeave/ApplyLeaveCommand';
import { UpdateLeaveCommand } from '../../application/commands/UpdateLeave/UpdateLeaveCommand';
import { CancelLeaveCommand } from '../../application/commands/CancelLeave/CancelLeaveCommand';
import { DeleteLeaveCommand } from '../../application/commands/DeleteLeave/DeleteLeaveCommand';

import { GetLeaveByIdQuery } from '../../application/queries/GetLeaveById/GetLeaveByIdQuery';
import { ListLeavesQuery } from '../../application/queries/ListLeaves/ListLeavesQuery';
import { GetLeaveBalanceQuery } from '../../application/queries/GetLeaveBalance/GetLeaveBalanceQuery';
import { ListLeaveTypesQuery } from '../../application/queries/ListLeaveTypes/ListLeaveTypesQuery';
import { ListHolidaysQuery } from '../../application/queries/ListHolidays/ListHolidaysQuery';

import { Result } from '../../../../../kernel/result/Result';
import { LeaveStatus } from '../../domain/enums/LeaveEnums';

@ApiTags('Leave Management')
@Controller('leave')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaveController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List leave requests for the authenticated company',
  })
  @ApiQuery({ name: 'status', enum: LeaveStatus, required: false })
  @ApiQuery({ name: 'employeeId', required: false, type: String })
  @ApiQuery({ name: 'leaveTypeId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listLeaves(
    @Request() req: any,
    @Query('status') status?: LeaveStatus,
    @Query('employeeId') employeeId?: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new ListLeavesQuery(
        req.user.companyId,
        employeeId,
        leaveTypeId,
        status,
        +page,
        +limit,
      ),
    );
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get leave balances for an employee' })
  @ApiQuery({ name: 'employeeId', required: true, type: String })
  @ApiQuery({ name: 'year', required: true, type: Number })
  async getBalance(
    @Request() req: any,
    @Query('employeeId') employeeId: string,
    @Query('year') year: string,
  ) {
    return this.queryBus.execute(
      new GetLeaveBalanceQuery(req.user.companyId, employeeId, +year),
    );
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all active leave types for the company' })
  async getTypes(@Request() req: any) {
    return this.queryBus.execute(new ListLeaveTypesQuery(req.user.companyId));
  }

  @Get('holidays')
  @ApiOperation({ summary: 'Get company holidays for a specific year' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  async getHolidays(@Request() req: any, @Query('year') year: string) {
    return this.queryBus.execute(
      new ListHolidaysQuery(req.user.companyId, +year),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave request by ID' })
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetLeaveByIdQuery(id, req.user.companyId));
  }

  @Post()
  @ApiOperation({ summary: 'Apply for a new leave' })
  async applyLeave(@Request() req: any, @Body() dto: ApplyLeaveRequestDto) {
    const result: Result<void> = await this.commandBus.execute(
      new ApplyLeaveCommand(
        dto.employeeId,
        req.user.companyId,
        dto.leaveTypeId,
        dto.startDate,
        dto.endDate,
        dto.reason,
        req.user.userId,
        dto.attachmentUrl,
        dto.durationDays,
        dto.isHalfDay,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing leave request' })
  async updateLeave(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeaveRequestDto,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new UpdateLeaveCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.startDate,
        dto.endDate,
        dto.reason,
        dto.attachmentUrl,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a pending or approved leave request' })
  async cancelLeave(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelLeaveRequestDto,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new CancelLeaveCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.reason,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a leave request' })
  async deleteLeave(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new DeleteLeaveCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) return { error: result.errorValue };
  }
}
