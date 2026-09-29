import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
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
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@ApiTags('Organization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organization')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Companies ────────────────────────────────────────────────────────────
  @Get('companies')
  @ApiOperation({ summary: 'List all companies accessible to the authenticated user' })
  async listCompanies(@Request() req: any) {
    const isCommon = Boolean(req.user.isCommon || req.user.roles?.includes('SUPER_ADMIN'));
    if (isCommon) {
      return this.prisma.company.findMany({
        where: { isActive: true, isDeleted: false },
        select: {
          id: true,
          businessId: true,
          name: true,
          legalName: true,
          code: true,
          logoUrl: true,
        },
        orderBy: { name: 'asc' },
      });
    }

    return this.prisma.company.findMany({
      where: {
        id: req.user.homeCompanyId || req.user.companyId,
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
        businessId: true,
        name: true,
        legalName: true,
        code: true,
        logoUrl: true,
      },
    });
  }

  @Get('company/me')
  @ApiOperation({ summary: 'Get current user company details' })
  @ApiResponse({ status: 200, type: OrganizationResponseDto })
  async getMyCompany(@Request() req: any): Promise<OrganizationResponseDto> {
    return this.queryBus.execute(new GetCompanyByIdQuery(req.user.companyId));
  }

  @Post('company')
  @ApiOperation({ summary: 'Create new company (Leadership / Super Admin)' })
  async createCompany(@Request() req: any, @Body() dto: CreateCompanyDto) {
    const isCommon = Boolean(req.user.isCommon || req.user.roles?.includes('SUPER_ADMIN'));
    if (!isCommon) {
      throw new ForbiddenException('Only common leadership or super administrators can create sister companies.');
    }
    return this.commandBus.execute(
      new CreateCompanyCommand(
        dto.name,
        dto.code,
        req.user.userId,
        dto.website,
        dto.industry,
        dto.registrationNumber,
        dto.taxNumber,
        dto.legalName,
        dto.address,
        dto.phone,
        dto.email,
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
