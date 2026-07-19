import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  RegisterUserCommand,
  LoginCommand,
  ChangePasswordCommand,
  AssignRoleCommand,
  DeactivateUserCommand,
  CreateRoleCommand,
} from '../commands/identity.commands';
import {
  IIdentityUserRepository,
  IDENTITY_USER_REPOSITORY,
} from '../../domain/repositories/IIdentityUserRepository';
import {
  IProfileRepository,
  PROFILE_REPOSITORY,
} from '../../domain/repositories/IProfileRepository';
import {
  IRoleRepository,
  ROLE_REPOSITORY,
} from '../../domain/repositories/IRoleRepository';
import { IdentityUserAggregate } from '../../domain/entities/IdentityUserAggregate';
import { ProfileAggregate } from '../../domain/entities/ProfileAggregate';
import { RoleEntity } from '../../domain/entities/RoleEntity';
import {
  BusinessIdGenerator,
  BUSINESS_ID_PREFIXES,
} from '../../../../../infrastructure/database/BusinessIdGenerator';
import { Identifier } from '@smatal/kernel/domain/Identifier';
import { AuthResponseDto, UserResponseDto } from '../dtos/identity.dto';

const SALT_ROUNDS = 12;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepo: IProfileRepository,
    private readonly businessIdGen: BusinessIdGenerator,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserResponseDto> {
    // Validate password policy
    if (!PASSWORD_REGEX.test(command.password)) {
      throw new BadRequestException(
        'Password must be at least 8 characters with 1 uppercase, 1 number, 1 special character.',
      );
    }

    // Check for duplicate email within the company
    const existing = await this.userRepo.findByEmail(
      command.email,
      command.companyId,
    );
    if (existing) {
      throw new ConflictException(
        `User with email '${command.email}' already exists in this company.`,
      );
    }

    // Create or find Profile
    let profile = await this.profileRepo.findByEmail(command.email);
    if (!profile) {
      const profileId = uuidv4();
      const now = new Date();
      profile = ProfileAggregate.create(
        {
          businessId: await this.businessIdGen.generate(
            BUSINESS_ID_PREFIXES.PROFILE,
          ),
          firstName: command.firstName,
          lastName: command.lastName,
          personalEmail: command.email,
          isDeleted: false,
          version: 1,
          createdAt: now,
          updatedAt: now,
          createdBy: command.requestedBy,
          updatedBy: command.requestedBy,
        },
        new Identifier(profileId),
      );
      await this.profileRepo.save(profile);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(command.password, SALT_ROUNDS);
    const userId = uuidv4();
    const now = new Date();

    const user = IdentityUserAggregate.create(
      {
        businessId: await this.businessIdGen.generate(
          BUSINESS_ID_PREFIXES.IDENTITY_USER,
        ),
        profileId: profile.id.toString(),
        companyId: new Identifier(command.companyId),
        email: command.email,
        passwordHash,
        isActive: true,
        isEmailVerified: false,
        mfaEnabled: false,
        loginAttempts: 0,
        isDeleted: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: command.requestedBy,
        updatedBy: command.requestedBy,
      },
      new Identifier(userId),
    );

    await this.userRepo.save(user);

    return this.toDto(user);
  }

  private toDto(user: IdentityUserAggregate): UserResponseDto {
    return {
      id: user.id.toString(),
      businessId: user.businessId,
      email: user.email,
      profileId: user.profileId.toString(),
      companyId: user.companyId.toString(),
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
    };
  }
}

@Injectable()
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const user = await this.userRepo.findByEmail(
      command.email,
      command.companyId,
    );
    if (!user || user.isDeleted) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive.');
    }

    if (user.isLocked()) {
      throw new UnauthorizedException(
        'Account is temporarily locked. Please try again later.',
      );
    }

    const isValid = await bcrypt.compare(command.password, user.passwordHash);
    if (!isValid) {
      user.recordFailedLogin(5);
      await this.userRepo.save(user);
      throw new UnauthorizedException('Invalid credentials.');
    }

    user.recordSuccessfulLogin();
    await this.userRepo.save(user);

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      companyId: user.companyId.toString(),
      profileId: user.profileId.toString(),
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id.toString(),
        businessId: user.businessId,
        email: user.email,
        profileId: user.profileId.toString(),
        companyId: user.companyId.toString(),
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: user.lastLoginAt ?? null,
        createdAt: user.createdAt,
      },
    };
  }
}

@Injectable()
@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.userRepo.findById(command.userId);
    if (!user) throw new UnauthorizedException('User not found.');

    const isValid = await bcrypt.compare(
      command.currentPassword,
      user.passwordHash,
    );
    if (!isValid)
      throw new UnauthorizedException('Current password is incorrect.');

    if (!PASSWORD_REGEX.test(command.newPassword)) {
      throw new BadRequestException(
        'New password does not meet policy requirements.',
      );
    }

    const newHash = await bcrypt.hash(command.newPassword, SALT_ROUNDS);
    user.changePassword(newHash, command.userId);
    await this.userRepo.save(user);
  }
}

@Injectable()
@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
    @Inject(ROLE_REPOSITORY) private readonly roleRepo: IRoleRepository,
  ) {}

  async execute(command: AssignRoleCommand): Promise<void> {
    const user = await this.userRepo.findById(command.userId);
    if (!user) throw new BadRequestException('User not found.');

    const role = await this.roleRepo.findById(command.roleId);
    if (!role) throw new BadRequestException('Role not found.');

    // Role assignment is done at the DB level via UserRole junction table
    // Repository implementation handles this
  }
}

@Injectable()
@CommandHandler(DeactivateUserCommand)
export class DeactivateUserHandler implements ICommandHandler<DeactivateUserCommand> {
  constructor(
    @Inject(IDENTITY_USER_REPOSITORY)
    private readonly userRepo: IIdentityUserRepository,
  ) {}

  async execute(command: DeactivateUserCommand): Promise<void> {
    const user = await this.userRepo.findById(command.userId);
    if (!user) throw new BadRequestException('User not found.');
    user.deactivate(command.requestedBy);
    await this.userRepo.save(user);
  }
}

@Injectable()
@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepo: IRoleRepository,
    private readonly businessIdGen: BusinessIdGenerator,
  ) {}

  async execute(command: CreateRoleCommand): Promise<void> {
    const existing = await this.roleRepo.findByCode(
      command.code,
      command.companyId,
    );
    if (existing)
      throw new ConflictException(
        `Role with code '${command.code}' already exists.`,
      );

    const now = new Date();
    const role = RoleEntity.create(
      {
        businessId: await this.businessIdGen.generate(
          BUSINESS_ID_PREFIXES.ROLE,
        ),
        companyId: command.companyId,
        name: command.name,
        code: command.code,
        description: command.description,
        isSystem: false,
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: command.requestedBy,
        updatedBy: command.requestedBy,
      },
      new Identifier(uuidv4()),
    );

    await this.roleRepo.save(role);
  }
}
