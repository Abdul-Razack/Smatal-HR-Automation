import {
  TenantIsolatedEntity,
  TenantIsolatedEntityProps,
} from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';

export interface LeaveTypeProps extends TenantIsolatedEntityProps {
  name: string;
  code: string;
  description: string | null;
  colorCode: string | null;
  isPaid: boolean;
  isActive: boolean;
}

export class LeaveType extends TenantIsolatedEntity<LeaveTypeProps> {
  private constructor(props: LeaveTypeProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(
    props: LeaveTypeProps,
    id: Identifier<string>,
  ): LeaveType {
    return new LeaveType(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get code(): string {
    return this.props.code;
  }

  get description(): string | null {
    return this.props.description;
  }

  get colorCode(): string | null {
    return this.props.colorCode;
  }

  get isPaid(): boolean {
    return this.props.isPaid;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
