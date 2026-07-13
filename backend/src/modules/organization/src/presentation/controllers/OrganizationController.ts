import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../../modules/identity/src/presentation/guards/JwtAuthGuard';
import {
  CreateCompanyDto,
  CreateBranchDto,
  CreateDepartmentDto,
  CreateDesignationDto,
  OrganizationResponseDto,
  DepartmentResponseDto,
} from '../../application/dtos/organization.dto';
import {
  CreateCompanyCommand,
  CreateBranchCommand,
  CreateDepartmentCommand,
  CreateDesignationCommand,
} from '../../application/commands/organization.commands';
import {
  GetCompanyByIdQuery,
  ListBranchesQuery,
  ListDepartmentsQuery,
  ListDesignationsQuery,
} from '../../application/queries/organization.queries';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ─── Company ──────────────────────────────────────────────────────────────
  @Get('company/me')
  @ApiOperation({ summary: 'Get current user company details' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  async getMyCompany(@Request() req: any): Promise<OrganizationResponseDto> {
    return this.queryBus.execute(new GetCompanyByIdQuery(req.user.companyId));
  }

  @Post('company')
  @ApiOperation({ summary: 'Create new company (Super Admin)' })
  async createCompany(@Request() req: any, @Body() dto: CreateCompanyDto) {
    await this.commandBus.execute(
      new CreateCompanyCommand(
        dto.name,
        dto.code,
        req.user.userId,
        dto.website,
        dto.industry,
        dto.registrationNumber,
        dto.taxNumber,
      ),
    );
  }

  // ─── Branches ─────────────────────────────────────────────────────────────
  @Get('branches')
  @ApiOperation({ summary: 'List all branches for company' })
  @ApiResponse({ status: 200, type: [OrganizationResponseDto] })
  async listBranches(@Request() req: any): Promise<OrganizationResponseDto[]> {
    return this.queryBus.execute(new ListBranchesQuery(req.user.companyId));
  }

  @Post('branches')
  @ApiOperation({ summary: 'Create new branch' })
  async createBranch(@Request() req: any, @Body() dto: CreateBranchDto) {
    await this.commandBus.execute(
      new CreateBranchCommand(
        req.user.companyId,
        dto.name,
        dto.code,
        dto.isHeadquarters,
        req.user.userId,
        dto.addressLine1,
        dto.city,
        dto.state,
        dto.country,
      ),
    );
  }

  // ─── Departments ──────────────────────────────────────────────────────────
  @Get('departments')
  @ApiOperation({ summary: 'List all departments for company' })
  @ApiResponse({ status: 200, type: [DepartmentResponseDto] })
  async listDepartments(@Request() req: any): Promise<DepartmentResponseDto[]> {
    return this.queryBus.execute(new ListDepartmentsQuery(req.user.companyId));
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create new department' })
  async createDepartment(
    @Request() req: any,
    @Body() dto: CreateDepartmentDto,
  ) {
    await this.commandBus.execute(
      new CreateDepartmentCommand(
        req.user.companyId,
        dto.name,
        dto.code,
        req.user.userId,
        dto.parentId,
      ),
    );
  }

  // ─── Designations ─────────────────────────────────────────────────────────
  @Get('designations')
  @ApiOperation({ summary: 'List all designations for company' })
  @ApiResponse({ status: 200, type: [OrganizationResponseDto] })
  async listDesignations(
    @Request() req: any,
  ): Promise<OrganizationResponseDto[]> {
    return this.queryBus.execute(new ListDesignationsQuery(req.user.companyId));
  }

  @Post('designations')
  @ApiOperation({ summary: 'Create new designation' })
  async createDesignation(
    @Request() req: any,
    @Body() dto: CreateDesignationDto,
  ) {
    await this.commandBus.execute(
      new CreateDesignationCommand(
        req.user.companyId,
        dto.name,
        dto.code,
        dto.level,
        req.user.userId,
      ),
    );
  }
}
