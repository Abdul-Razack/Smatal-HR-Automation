import { AggregateRoot } from '@smatal/kernel/domain/AggregateRoot';
import { Identifier } from '@smatal/kernel/domain/Identifier';
import { BaseBusinessEntityProps } from '@smatal/kernel/domain/models/BaseBusinessEntity';

export interface ProfileProps extends BaseBusinessEntityProps {
  firstName: string;
  lastName: string;
  personalEmail: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  nationality?: string | null;
  profilePhoto?: string | null;
}

export class ProfileAggregate extends AggregateRoot<ProfileProps> {
  private constructor(props: ProfileProps, id: Identifier<string>) {
    super(props, id);
  }

  static create(props: ProfileProps, id: Identifier<string>): ProfileAggregate {
    return new ProfileAggregate(props, id);
  }

  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }
  get personalEmail(): string {
    return this.props.personalEmail;
  }
  get phone(): string | null | undefined {
    return this.props.phone;
  }
  get dateOfBirth(): Date | null | undefined {
    return this.props.dateOfBirth;
  }
  get profilePhoto(): string | null | undefined {
    return this.props.profilePhoto;
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

  updateName(firstName: string, lastName: string, updatedBy: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
    this.props.version++;
  }

  updatePhoto(photoUrl: string, updatedBy: string): void {
    this.props.profilePhoto = photoUrl;
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
  }
}
