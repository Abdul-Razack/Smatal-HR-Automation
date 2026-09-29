import {
  Controller,
  Get,
  Patch,
  Put,
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
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../identity/src/presentation/guards/RolesGuard';
import { Roles } from '../../../../identity/src/presentation/guards/roles.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  TerminateEmployeeRequest,
  TransitionLifecycleRequest,
  SubmitResignationRequest,
  UpdateResignationRequest,
  AcceptResignationRequest,
  WithdrawResignationRequest,
  UpdateClearanceRequest,
  CompleteExitRequest,
} from '../../application/dto/requests/EmployeeRequests';
import { CreateEmployeeCommand } from '../../application/commands/CreateEmployee/CreateEmployeeCommand';
import { UpdateEmployeeCommand } from '../../application/commands/UpdateEmployee/UpdateEmployeeCommand';
import { ActivateEmployeeCommand } from '../../application/commands/ActivateEmployee/ActivateEmployeeCommand';
import { TerminateEmployeeCommand } from '../../application/commands/TerminateEmployee/TerminateEmployeeCommand';
import { TransitionLifecycleCommand } from '../../application/commands/TransitionLifecycle/TransitionLifecycleCommand';
import { DeleteEmployeeCommand } from '../../application/commands/DeleteEmployee/DeleteEmployeeCommand';
import { SubmitResignationCommand } from '../../application/commands/SubmitResignation/SubmitResignationCommand';
import { AcceptResignationCommand } from '../../application/commands/AcceptResignation/AcceptResignationCommand';
import { WithdrawResignationCommand } from '../../application/commands/WithdrawResignation/WithdrawResignationCommand';
import { InitiateClearanceCommand } from '../../application/commands/InitiateClearance/InitiateClearanceCommand';
import { UpdateClearanceCommand } from '../../application/commands/UpdateClearance/UpdateClearanceCommand';
import { CompleteExitCommand } from '../../application/commands/CompleteExit/CompleteExitCommand';
import { GetEmployeeQuery } from '../../application/queries/GetEmployee/GetEmployeeQuery';
import { ListEmployeesQuery } from '../../application/queries/ListEmployees/ListEmployeesQuery';
import { GetEmploymentHistoryQuery } from '../../application/queries/GetEmploymentHistory/GetEmploymentHistoryQuery';
import { GetResignationQuery } from '../../application/queries/GetResignation/GetResignationQuery';
import { GetClearanceListQuery } from '../../application/queries/GetClearanceList/GetClearanceListQuery';
import { GetExitOverviewQuery } from '../../application/queries/GetExitOverview/GetExitOverviewQuery';
import { ClearanceDepartment } from '../../domain/enums/ResignationEnums';
import { EmployeeStatus } from '../../domain/enums/EmployeeStatus';
import { Result } from '../../../../../kernel/result/Result';
import { EmployeeResponseDto } from '../../application/dto/responses/EmployeeResponseDto';
import { GetAllGeneratedDocumentsQuery } from '../../../../document/src/application/queries/GetAllGeneratedDocuments/GetAllGeneratedDocumentsQuery';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Create employee directly' })
  async create(
    @Request() req: any,
    @Body() dto: CreateEmployeeRequest,
  ): Promise<EmployeeResponseDto> {
    const result: Result<EmployeeResponseDto> = await this.commandBus.execute(
      new CreateEmployeeCommand(
        req.user.companyId,
        req.user.userId,
        dto.firstName,
        dto.lastName,
        dto.personalEmail,
        new Date(dto.joinedDate),
        dto.phone,
        dto.address,
        dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        dto.gender,
        dto.departmentId,
        dto.designationId,
        dto.branchId,
        dto.reportsToId,
        dto.employeeNumber,
        dto.employmentType,
        dto.salary,
        dto.status,
        dto.probationEndDate ? new Date(dto.probationEndDate) : undefined,
        dto.dynamicFields,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return result.getValue();
  }

  @Get()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'List employees for the authenticated company' })
  @ApiQuery({ name: 'status', enum: EmployeeStatus, required: false })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async list(
    @Request() req: any,
    @Query('status') status?: EmployeeStatus,
    @Query('departmentId') departmentId?: string,
    @Query('search') search?: string,
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
        'createdAt',
        'desc',
        search,
      ),
    );
  }

  @Get('exit/overview')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Get exit & resignation pipeline overview metrics' })
  async getExitOverview(@Request() req: any) {
    return this.queryBus.execute(new GetExitOverviewQuery(req.user.companyId));
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get employee by ID' })
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetEmployeeQuery(id, req.user.companyId));
  }

  @Get(':id/history')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get employment history' })
  async getHistory(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetEmploymentHistoryQuery(id, req.user.companyId));
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
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
        dto.firstName,
        dto.lastName,
        dto.personalEmail,
        dto.phone,
        dto.address,
        dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        dto.gender,
        dto.employmentType,
        dto.salary,
        dto.joinedDate ? new Date(dto.joinedDate) : undefined,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true };
  }

  @Post(':id/lifecycle/transition')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Transition employee lifecycle status' })
  async transitionLifecycle(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionLifecycleRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new TransitionLifecycleCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.status,
        dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        dto.probationEndDate ? new Date(dto.probationEndDate) : undefined,
        dto.confirmationDate ? new Date(dto.confirmationDate) : undefined,
        dto.resignationDate ? new Date(dto.resignationDate) : undefined,
        dto.lastWorkingDate ? new Date(dto.lastWorkingDate) : undefined,
        dto.noticePeriodDays,
        dto.notes,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, status: dto.status };
  }

  @Post(':id/activate')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Activate employee (ONBOARDING → ACTIVE)' })
  async activate(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new ActivateEmployeeCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true };
  }

  @Post(':id/terminate')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
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
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true };
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete employee' })
  async delete(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result: Result<void> = await this.commandBus.execute(
      new DeleteEmployeeCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
  }

  @Post(':id/resignation')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Submit employee resignation' })
  async submitResignation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitResignationRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new SubmitResignationCommand(
        id,
        req.user.companyId,
        req.user.userId,
        req.user.role,
        new Date(dto.resignationDate),
        dto.reason,
        dto.noticePeriodDays,
        dto.lastWorkingDate ? new Date(dto.lastWorkingDate) : undefined,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, message: 'Resignation submitted successfully' };
  }

  @Get(':id/resignation')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get resignation details and history for an employee' })
  async getResignation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user.role === 'EMPLOYEE' && req.user.employeeId && req.user.employeeId !== id) {
      throw new ForbiddenException('Access denied: You are only authorized to view your own resignation.');
    }
    return this.queryBus.execute(new GetResignationQuery(id, req.user.companyId));
  }

  @Patch(':id/resignation')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Update resignation details while in SUBMITTED state' })
  async updateResignation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResignationRequest,
  ) {
    const existing = await this.queryBus.execute(new GetResignationQuery(id, req.user.companyId));
    const result: Result<void> = await this.commandBus.execute(
      new SubmitResignationCommand(
        id,
        req.user.companyId,
        req.user.userId,
        req.user.role,
        existing.resignationDate ? new Date(existing.resignationDate) : new Date(),
        dto.reason ?? existing.reason ?? 'Resignation',
        dto.noticePeriodDays ?? existing.noticePeriodDays ?? 30,
        dto.lastWorkingDate ? new Date(dto.lastWorkingDate) : (existing.lastWorkingDate ? new Date(existing.lastWorkingDate) : undefined),
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, message: 'Resignation details updated successfully' };
  }

  @Post(':id/resignation/accept')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Accept employee resignation and transition to NOTICE_PERIOD' })
  async acceptResignation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AcceptResignationRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new AcceptResignationCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.comments,
        dto.lastWorkingDate ? new Date(dto.lastWorkingDate) : undefined,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, message: 'Resignation accepted. Employee transitioned to NOTICE_PERIOD.' };
  }

  @Post(':id/resignation/withdraw')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Withdraw employee resignation' })
  async withdrawResignation(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: WithdrawResignationRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new WithdrawResignationCommand(
        id,
        req.user.companyId,
        req.user.userId,
        req.user.role,
        dto.reason,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, message: 'Resignation withdrawn successfully' };
  }

  @Post(':id/clearance/initiate')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Initiate departmental exit clearance checklist' })
  async initiateClearance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new InitiateClearanceCommand(id, req.user.companyId, req.user.userId),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, message: 'Exit clearance checklist initiated' };
  }

  @Get(':id/clearance')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get exit clearance checklist' })
  async getClearance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    if (req.user.role === 'EMPLOYEE' && req.user.employeeId && req.user.employeeId !== id) {
      throw new ForbiddenException('Access denied: You are only authorized to view your own clearance.');
    }
    return this.queryBus.execute(new GetClearanceListQuery(id, req.user.companyId));
  }

  @Put(':id/clearance/:department')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Update departmental clearance status and remarks' })
  async updateClearance(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('department') department: ClearanceDepartment,
    @Body() dto: UpdateClearanceRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new UpdateClearanceCommand(
        id,
        req.user.companyId,
        req.user.userId,
        department,
        dto.status as any,
        dto.remarks,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, message: `Clearance for ${department} updated successfully` };
  }

  @Post(':id/exit/complete')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Complete employee exit, verify clearances, and transition to RELIEVED' })
  async completeExit(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteExitRequest,
  ) {
    const result: Result<void> = await this.commandBus.execute(
      new CompleteExitCommand(
        id,
        req.user.companyId,
        req.user.userId,
        dto.lastWorkingDate ? new Date(dto.lastWorkingDate) : undefined,
        dto.notes,
      ),
    );
    if (result.isFailure) {
      throw new BadRequestException(result.errorValue);
    }
    return { success: true, message: 'Exit processing completed. Employee is now RELIEVED.' };
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Get generated documents for a specific employee' })
  async getEmployeeDocuments(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const employee: EmployeeResponseDto = await this.queryBus.execute(
      new GetEmployeeQuery(id, req.user.companyId),
    );
    if (!employee) {
      throw new BadRequestException('Employee not found or does not belong to your company');
    }

    if (
      req.user.role === 'EMPLOYEE' &&
      req.user.employeeId !== id &&
      req.user.profileId !== employee.profileId
    ) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to access your own documents.',
      );
    }

    const docsResult = await this.queryBus.execute(
      new GetAllGeneratedDocumentsQuery(req.user.companyId, {
        employeeId: id,
      }),
    );
    if (docsResult.isFailure) {
      throw new BadRequestException(docsResult.errorValue);
    }

    return docsResult.getValue();
  }
}
