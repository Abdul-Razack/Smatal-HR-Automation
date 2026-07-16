import { Injectable } from '@nestjs/common';
import { LeaveDurationType } from '../../domain/enums/LeaveEnums';

@Injectable()
export class LeaveDurationCalculator {
  /**
   * Calculates the actual leave duration based on start/end dates,
   * skipping weekends, and factoring in the duration type.
   */
  calculateDuration(
    startDate: Date,
    endDate: Date,
    durationType: LeaveDurationType,
    holidays: Date[] = [],
  ): number {
    if (durationType === LeaveDurationType.HALF_DAY) {
      return 0.5;
    }

    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    let days = 0;
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

      const isHoliday = holidays.some(
        (h) => h.toDateString() === current.toDateString(),
      );

      if (!isWeekend && !isHoliday) {
        days += 1;
      }

      current.setDate(current.getDate() + 1);
    }

    return days;
  }
}
