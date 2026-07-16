import { ValueObject } from '../../../../../kernel/domain/ValueObject';
import { LeaveDurationType } from '../enums/LeaveEnums';

interface LeaveDurationProps {
  days: number;
  type: LeaveDurationType;
}

export class LeaveDuration extends ValueObject<LeaveDurationProps> {
  private constructor(props: LeaveDurationProps) {
    super(props);
  }

  public static create(days: number, type: LeaveDurationType): LeaveDuration {
    if (days <= 0) {
      throw new Error('Leave duration must be greater than zero.');
    }
    if (type === LeaveDurationType.HALF_DAY && days !== 0.5) {
      throw new Error('Half day leave must have a duration of 0.5 days.');
    }
    return new LeaveDuration({ days, type });
  }

  get days(): number {
    return this.props.days;
  }

  get type(): LeaveDurationType {
    return this.props.type;
  }
}
