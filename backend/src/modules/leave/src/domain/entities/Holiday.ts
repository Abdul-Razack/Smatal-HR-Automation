import {
  TenantIsolatedEntity,
  TenantIsolatedEntityProps,
} from '../../../../../kernel/domain/models/TenantIsolatedEntity';
import { Identifier } from '../../../../../kernel/domain/Identifier';
import { HolidayType } from '../enums/LeaveEnums';

export interface HolidayProps extends TenantIsolatedEntityProps {
  name: string;
  date: Date;
  type: HolidayType;
  description: string | null;
  branchId: Identifier<string> | null;
  isActive: boolean;
}

export class Holiday extends TenantIsolatedEntity<HolidayProps> {
  private constructor(props: HolidayProps, id: Identifier<string>) {
    super(props, id);
  }

  public static create(props: HolidayProps, id: Identifier<string>): Holiday {
    return new Holiday(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get date(): Date {
    return this.props.date;
  }

  get type(): HolidayType {
    return this.props.type;
  }

  get description(): string | null {
    return this.props.description;
  }

  get branchId(): Identifier<string> | null {
    return this.props.branchId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }
}
