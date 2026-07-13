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
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';
import {
  ListRolesQuery,
  GetRoleByIdQuery,
} from '../../application/queries/identity.queries';
import {
  CreateRoleCommand,
  AssignRoleCommand,
} from '../../application/commands/identity.commands';
import {
  CreateRoleDto,
  AssignRoleDto,
  RoleResponseDto,
} from '../../application/dtos/identity.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all roles for company' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  async listRoles(@Request() req: any): Promise<RoleResponseDto[]> {
    return this.queryBus.execute(new ListRolesQuery(req.user.companyId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  async getRoleById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<RoleResponseDto> {
    return this.queryBus.execute(new GetRoleByIdQuery(id, req.user.companyId));
  }

  @Post()
  @ApiOperation({ summary: 'Create custom role' })
  async createRole(@Request() req: any, @Body() dto: CreateRoleDto) {
    await this.commandBus.execute(
      new CreateRoleCommand(
        dto.name,
        dto.code,
        dto.companyId || req.user.companyId,
        req.user.userId,
        dto.description,
      ),
    );
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRole(@Request() req: any, @Body() dto: AssignRoleDto) {
    await this.commandBus.execute(
      new AssignRoleCommand(
        dto.userId,
        dto.roleId,
        req.user.companyId,
        req.user.userId,
        dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      ),
    );
  }
}
