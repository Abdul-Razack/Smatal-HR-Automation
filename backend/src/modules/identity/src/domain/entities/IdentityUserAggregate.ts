import { AggregateRoot } from '@smatal/kernel/domain/AggregateRoot';
import { Identifier } from '@smatal/kernel/domain/Identifier';
import { TenantIsolatedEntityProps } from '@smatal/kernel/domain/models/TenantIsolatedEntity';

export interface IdentityUserProps extends TenantIsolatedEntityProps {
  profileId: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | null;
  mfaEnabled: boolean;
  mfaSecret?: string | null;
  lastLoginAt?: Date | null;
  loginAttempts: number;
  lockedUntil?: Date | null;
  passwordChangedAt?: Date | null;

  firstName?: string;
  lastName?: string;
  avatar?: string | null;
}

export class IdentityUserAggregate extends AggregateRoot<IdentityUserProps> {
  private constructor(props: IdentityUserProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(
    props: IdentityUserProps,
    id: Identifier<string>,
  ): IdentityUserAggregate {
    return new IdentityUserAggregate(props, id);
  }

  get profileId(): string {
    return this.props.profileId;
  }
  get companyId(): string {
    return this.props.companyId.toString();
  }
  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }
  get mfaEnabled(): boolean {
    return this.props.mfaEnabled;
  }
  get lastLoginAt(): Date | null | undefined {
    return this.props.lastLoginAt;
  }
  get loginAttempts(): number {
    return this.props.loginAttempts;
  }
  get lockedUntil(): Date | null | undefined {
    return this.props.lockedUntil;
  }
  get businessId(): string {
    return this.props.businessId;
  }
  get version(): number {
    return this.props.version;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }
  get firstName(): string | undefined {
    return this.props.firstName;
  }
  get lastName(): string | undefined {
    return this.props.lastName;
  }
  get avatar(): string | null | undefined {
    return this.props.avatar;
  }

  isLocked(): boolean {
    if (!this.props.lockedUntil) return false;
    return this.props.lockedUntil > new Date();
  }

  recordFailedLogin(maxAttempts: number): void {
    this.props.loginAttempts++;
    this.props.updatedAt = new Date();
    if (this.props.loginAttempts >= maxAttempts) {
      this.props.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    }
  }

  recordSuccessfulLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.loginAttempts = 0;
    this.props.lockedUntil = null;
    this.props.updatedAt = new Date();
  }

  changePassword(newPasswordHash: string, updatedBy: string): void {
    this.props.passwordHash = newPasswordHash;
    this.props.passwordChangedAt = new Date();
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
    this.props.version++;
  }

  deactivate(updatedBy: string): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }

  unlock(): void {
    this.props.loginAttempts = 0;
    this.props.lockedUntil = null;
    this.props.updatedAt = new Date();
  }

  verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.emailVerifiedAt = new Date();
    this.props.updatedAt = new Date();
  }
}
