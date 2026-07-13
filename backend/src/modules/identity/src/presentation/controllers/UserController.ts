import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Post,
  Body,
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
  GetUserByIdQuery,
  ListUsersQuery,
} from '../../application/queries/identity.queries';
import { DeactivateUserCommand } from '../../application/commands/identity.commands';
import { UserResponseDto } from '../../application/dtos/identity.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMe(@Request() req: any): Promise<UserResponseDto> {
    return this.queryBus.execute(
      new GetUserByIdQuery(req.user.userId, req.user.companyId),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getUserById(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserByIdQuery(id, req.user.companyId));
  }

  @Get()
  @ApiOperation({ summary: 'List users in company (paginated)' })
  async listUsers(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.queryBus.execute(
      new ListUsersQuery(req.user.companyId, {
        page: Number(page),
        limit: Number(limit),
      }),
    );
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivateUser(@Request() req: any, @Param('id') id: string) {
    await this.commandBus.execute(
      new DeactivateUserCommand(id, req.user.companyId, req.user.userId),
    );
  }
}
