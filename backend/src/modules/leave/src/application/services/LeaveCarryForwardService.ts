import { Injectable, Logger, Inject } from '@nestjs/common';
import { ILeaveBalanceRepository } from '../../domain/repositories/ILeaveBalanceRepository';
import { CarryForwardType } from '../../domain/enums/LeaveEnums';
import { LeavePolicy } from '../../domain/entities/LeavePolicy';

@Injectable()
export class LeaveCarryForwardService {
  private readonly logger = new Logger(LeaveCarryForwardService.name);

  constructor(
    @Inject('ILeaveBalanceRepository')
    private readonly balanceRepo: ILeaveBalanceRepository,
  ) {}

  /**
   * Processes year-end carry forward from previous year to new year.
   */
  async processYearEndCarryForward(
    employeeId: string,
    policy: LeavePolicy,
    previousYear: number,
    newYear: number,
    performedBy: string,
  ): Promise<void> {
    if (policy.carryForwardType === CarryForwardType.NONE) {
      return;
    }

    try {
      const previousBalance = await this.balanceRepo.findSpecificBalance(
        employeeId,
        policy.leaveTypeId.toString(),
        previousYear,
      );

      if (!previousBalance) return;

      const newBalance = await this.balanceRepo.findSpecificBalance(
        employeeId,
        policy.leaveTypeId.toString(),
        newYear,
      );

      if (!newBalance) {
        this.logger.warn(
          `New year balance record not found for employee ${employeeId}`,
        );
        return;
      }

      let carryForwardAmount = previousBalance.availableBalance;

      if (
        policy.carryForwardType === CarryForwardType.CAPPED &&
        policy.maxCarryForwardDays !== null
      ) {
        carryForwardAmount = Math.min(
          carryForwardAmount,
          policy.maxCarryForwardDays,
        );
      }

      if (carryForwardAmount > 0) {
        const props = (newBalance as any).props;
        props.carriedForward += carryForwardAmount;
        props.updatedBy = performedBy;
        props.updatedAt = new Date();
        props.version++;

        await this.balanceRepo.save(newBalance);
        this.logger.debug(
          `Carried forward ${carryForwardAmount} days for employee ${employeeId}`,
        );
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to process carry forward for employee ${employeeId}: ${error.message}`,
      );
    }
  }
}
