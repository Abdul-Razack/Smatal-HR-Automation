import { Injectable, Logger, Inject } from '@nestjs/common';
import { ILeaveBalanceRepository } from '../../domain/repositories/ILeaveBalanceRepository';
import { LeaveAccrualType } from '../../domain/enums/LeaveEnums';
import { LeavePolicy } from '../../domain/entities/LeavePolicy';

@Injectable()
export class LeaveAccrualService {
  private readonly logger = new Logger(LeaveAccrualService.name);

  constructor(
    @Inject('ILeaveBalanceRepository')
    private readonly balanceRepo: ILeaveBalanceRepository,
  ) {}

  /**
   * Processes monthly accrual for a given employee and policy.
   */
  async processMonthlyAccrual(
    employeeId: string,
    policy: LeavePolicy,
    year: number,
    performedBy: string,
  ): Promise<void> {
    if (policy.accrualType !== LeaveAccrualType.MONTHLY) {
      return;
    }

    try {
      const balance = await this.balanceRepo.findSpecificBalance(
        employeeId,
        policy.leaveTypeId.toString(),
        year,
      );

      if (!balance) {
        this.logger.warn(
          `No balance record found for employee ${employeeId} and leave type ${policy.leaveTypeId.toString()}`,
        );
        return;
      }

      const monthlyAccrualAmount = policy.annualEntitlement / 12;

      const props = (balance as any).props;
      props.accruedDays += monthlyAccrualAmount;
      props.updatedBy = performedBy;
      props.updatedAt = new Date();
      props.version++;

      await this.balanceRepo.save(balance);
      this.logger.debug(
        `Accrued ${monthlyAccrualAmount} days for employee ${employeeId}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to process accrual for employee ${employeeId}: ${error.message}`,
      );
    }
  }
}
