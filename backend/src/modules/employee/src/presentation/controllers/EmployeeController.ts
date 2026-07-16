import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  UpdateEmployeeRequest,
  TerminateEmployeeRequest,
} from '../../application/dto/requests/EmployeeRequests';
import { UpdateEmployeeCommand } from '../../application/commands/UpdateEmployee/UpdateEmployeeCommand';
import { ActivateEmployeeCommand } from '../../application/commands/ActivateEmployee/ActivateEmployeeCommand';
import { TerminateEmployeeCommand } from '../../application/commands/TerminateEmployee/TerminateEmployeeCommand';
import { DeleteEmployeeCommand } from '../../application/commands/DeleteEmployee/DeleteEmployeeCommand';
import { GetEmployeeQuery } from '../../application/queries/GetEmployee/GetEmployeeQuery';
import { ListEmployeesQuery } from '../../application/queries/ListEmployees/ListEmployeesQuery';
import { GetEmploymentHistoryQuery } from '../../application/queries/GetEmploymentHistory/GetEmploymentHistoryQuery';
import { EmployeeStatus } from '../../domain/enums/EmployeeStatus';
import { Result } from '../../../../../kernel/result/Result';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List employees for the authenticated company' })
  @ApiQuery({ name: 'status', enum: EmployeeStatus, required: false })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @Request() req: any,
    @Query('status') status?: EmployeeStatus,
    @Query('departmentId') departmentId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new ListEmployeesQuery(
        req.user.companyId,
        status,
        departmentId,
        +page,
        +limit,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetEmployeeQuery(id, req.user.companyId));
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get employment history' })
  async getHistory(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetEmploymentHistoryQuery(id, req.user.companyId));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee details' })
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmployeeRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new UpdateEmployeeCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.departmentId,
        dto.designationId,
        dto.branchId,
        dto.reportsToId,
        dto.employeeNumber,
        dto.dynamicFields,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate employee (ONBOARDING → ACTIVE)' })
  async activate(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new ActivateEmployeeCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate employee' })
  async terminate(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TerminateEmployeeRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new TerminateEmployeeCommand(
        id,
        req.user.companyId,
        req.user.userId,
        new Date(dto.terminationDate),
        dto.reason,
      ),
    );
    if (result.isFailure) return { error: result.errorValue };
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete employee' })
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new DeleteEmployeeCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) return { error: result.errorValue };
  }
}
