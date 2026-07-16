import { ICommand } from '@smatal/kernel/cqrs/cqrs.contracts';

// ─── Register ────────────────────────────────────────────────────────────────
export class RegisterUserCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly companyId: string,
    public readonly requestedBy: string,
  ) {}
}

// ─── Login ───────────────────────────────────────────────────────────────────
export class LoginCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly companyId?: string,
  ) {}
}

// ─── Refresh Token ───────────────────────────────────────────────────────────
export class RefreshTokenCommand implements ICommand {
  constructor(public readonly refreshToken: string) {}
}

// ─── Change Password ─────────────────────────────────────────────────────────
export class ChangePasswordCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}

// ─── Forgot Password ─────────────────────────────────────────────────────────
export class ForgotPasswordCommand implements ICommand {
  constructor(
    public readonly email: string,
    public readonly companyId: string,
  ) {}
}

// ─── Reset Password ──────────────────────────────────────────────────────────
export class ResetPasswordCommand implements ICommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
  ) {}
}

// ─── Assign Role ─────────────────────────────────────────────────────────────
export class AssignRoleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly companyId: string,
    public readonly assignedBy: string,
    public readonly expiresAt?: Date,
  ) {}
}

// ─── Remove Role ─────────────────────────────────────────────────────────────
export class RemoveRoleCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly companyId: string,
  ) {}
}

// ─── Create Role ─────────────────────────────────────────────────────────────
export class CreateRoleCommand implements ICommand {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly companyId: string,
    public readonly requestedBy: string,
    public readonly description?: string,
  ) {}
}

// ─── Deactivate User ─────────────────────────────────────────────────────────
export class DeactivateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly companyId: string,
    public readonly requestedBy: string,
  ) {}
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export class LogoutCommand implements ICommand {
  constructor(public readonly userId: string) {}
}
