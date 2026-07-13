import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  AuthResponseDto,
  UserResponseDto,
} from '../../application/dtos/identity.dto';
import {
  RegisterUserCommand,
  LoginCommand,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
  RefreshTokenCommand,
  LogoutCommand,
} from '../../application/commands/identity.commands';
import { JwtAuthGuard } from '../guards/JwtAuthGuard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.commandBus.execute(
      new RegisterUserCommand(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.companyId,
        'system', // in a real app, might be an admin inviting them, or self-registration
      ),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and get JWT tokens' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(
      new LoginCommand(dto.email, dto.password, dto.companyId),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    await this.commandBus.execute(
      new ChangePasswordCommand(
        req.user.userId,
        dto.currentPassword,
        dto.newPassword,
      ),
    );
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.commandBus.execute(
      new ForgotPasswordCommand(dto.email, dto.companyId),
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.commandBus.execute(
      new ResetPasswordCommand(dto.token, dto.newPassword),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user (invalidate tokens)' })
  async logout(@Request() req: any) {
    await this.commandBus.execute(new LogoutCommand(req.user.userId));
  }
}
