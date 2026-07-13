import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { BusinessIdGenerator } from '../../../infrastructure/database/BusinessIdGenerator';

// Controllers
import { AuthController } from './presentation/controllers/AuthController';
import { UserController } from './presentation/controllers/UserController';
import { RoleController } from './presentation/controllers/RoleController';

// Repositories
import { IDENTITY_USER_REPOSITORY } from './domain/repositories/IIdentityUserRepository';
import { PrismaIdentityUserRepository } from './infrastructure/repositories/PrismaIdentityUserRepository';
import { PROFILE_REPOSITORY } from './domain/repositories/IProfileRepository';
import { PrismaProfileRepository } from './infrastructure/repositories/PrismaProfileRepository';
import { ROLE_REPOSITORY } from './domain/repositories/IRoleRepository';
import { PrismaRoleRepository } from './infrastructure/repositories/PrismaRoleRepository';

// Handlers
import {
  RegisterUserHandler,
  LoginHandler,
  ChangePasswordHandler,
  AssignRoleHandler,
  DeactivateUserHandler,
  CreateRoleHandler,
} from './application/commands/identity.handlers';
import {
  GetUserByIdHandler,
  GetUserByEmailHandler,
  ListUsersHandler,
  GetRoleByIdHandler,
  ListRolesHandler,
  GetProfileByIdHandler,
} from './application/queries/identity.query.handlers';

// Auth Strategies
import { JwtStrategy } from './infrastructure/auth/JwtStrategy';
import { JwtRefreshStrategy } from './infrastructure/auth/JwtRefreshStrategy';

const CommandHandlers = [
  RegisterUserHandler,
  LoginHandler,
  ChangePasswordHandler,
  AssignRoleHandler,
  DeactivateUserHandler,
  CreateRoleHandler,
];

const QueryHandlers = [
  GetUserByIdHandler,
  GetUserByEmailHandler,
  ListUsersHandler,
  GetRoleByIdHandler,
  ListRolesHandler,
  GetProfileByIdHandler,
];

const Repositories = [
  { provide: IDENTITY_USER_REPOSITORY, useClass: PrismaIdentityUserRepository },
  { provide: PROFILE_REPOSITORY, useClass: PrismaProfileRepository },
  { provide: ROLE_REPOSITORY, useClass: PrismaRoleRepository },
];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController, UserController, RoleController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...Repositories,
    JwtStrategy,
    JwtRefreshStrategy,
    BusinessIdGenerator, // from infrastructure
  ],
  exports: [...Repositories, JwtStrategy, JwtRefreshStrategy, JwtModule],
})
export class IdentityModule {}
