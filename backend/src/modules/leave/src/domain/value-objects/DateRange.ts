import { ValueObject } from '../../../../../kernel/domain/ValueObject';

interface DateRangeProps {
  startDate: Date;
  endDate: Date;
}

export class DateRange extends ValueObject<DateRangeProps> {
  private constructor(props: DateRangeProps) {
    super(props);
  }

  public static create(startDate: Date, endDate: Date): DateRange {
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date.');
    }
    return new DateRange({ startDate, endDate });
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }
}
