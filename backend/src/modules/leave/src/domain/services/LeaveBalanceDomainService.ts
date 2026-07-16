import { Injectable } from '@nestjs/common';
import { LeaveBalance } from '../entities/LeaveBalance';

export class InsufficientLeaveBalanceException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientLeaveBalanceException';
  }
}

@Injectable()
export class LeaveBalanceDomainService {
  /**
   * Checks if there's enough available balance.
   */
  checkAvailableBalance(balance: LeaveBalance, daysRequested: number): void {
    if (balance.availableBalance < daysRequested) {
      throw new InsufficientLeaveBalanceException(
        `Insufficient balance. Available: ${balance.availableBalance}, Requested: ${daysRequested}`,
      );
    }
  }

  /**
   * Called when a leave request is APPLIED. Deducts from available by increasing pending.
   */
  holdPendingBalance(
    balance: LeaveBalance,
    days: number,
    performedBy: string,
  ): void {
    this.checkAvailableBalance(balance, days);

    // Need to use any to bypass readonly since these are standard mutations for the balance
    const props = (balance as any).props;
    props.pendingDays += days;
    props.updatedBy = performedBy;
    props.updatedAt = new Date();
    props.version++;
  }

  /**
   * Called when a leave request is APPROVED. Moves pending days to used days.
   */
  commitApprovedBalance(
    balance: LeaveBalance,
    days: number,
    performedBy: string,
  ): void {
    const props = (balance as any).props;
    props.pendingDays = Math.max(0, props.pendingDays - days);
    props.usedDays += days;
    props.updatedBy = performedBy;
    props.updatedAt = new Date();
    props.version++;
  }

  /**
   * Called when a leave request is REJECTED. Restores the pending balance.
   */
  restorePendingBalance(
    balance: LeaveBalance,
    days: number,
    performedBy: string,
  ): void {
    const props = (balance as any).props;
    props.pendingDays = Math.max(0, props.pendingDays - days);
    props.updatedBy = performedBy;
    props.updatedAt = new Date();
    props.version++;
  }

  /**
   * Called when an already approved leave is CANCELLED. Restores the used balance.
   */
  restoreUsedBalance(
    balance: LeaveBalance,
    days: number,
    performedBy: string,
  ): void {
    const props = (balance as any).props;
    props.usedDays = Math.max(0, props.usedDays - days);
    props.updatedBy = performedBy;
    props.updatedAt = new Date();
    props.version++;
  }
}
