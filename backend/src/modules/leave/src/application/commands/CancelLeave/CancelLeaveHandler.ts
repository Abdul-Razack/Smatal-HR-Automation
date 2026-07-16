import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelLeaveCommand } from './CancelLeaveCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { ILeaveBalanceRepository } from '../../../domain/repositories/ILeaveBalanceRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { LeaveBalanceDomainService } from '../../../domain/services/LeaveBalanceDomainService';
import { LeaveStatus } from '../../../domain/enums/LeaveEnums';

@CommandHandler(CancelLeaveCommand)
@Injectable()
export class CancelLeaveHandler implements ICommandHandler<CancelLeaveCommand> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @Inject('ILeaveBalanceRepository')
    private readonly leaveBalanceRepository: ILeaveBalanceRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly balanceDomainService: LeaveBalanceDomainService,
  ) {}

  async execute(command: CancelLeaveCommand): Promise<Result<void>> {
    try {
      const leave = await this.leaveRequestRepository.findById(
        command.leaveRequestId,
      );
      if (!leave) return Result.fail<void>('Leave request not found');
      if (leave.companyId.toString() !== command.companyId)
        return Result.fail<void>('Unauthorized');

      const currentStatus = leave.status;
      // cancel() internally emits LeaveCancelledEvent
      leave.cancel(command.performedBy, command.reason);

      const currentYear = new Date().getFullYear();
      const balance = await this.leaveBalanceRepository.findSpecificBalance(
        leave.employeeId.toString(),
        leave.leaveTypeId.toString(),
        currentYear,
      );

      if (balance) {
        if (currentStatus === LeaveStatus.PENDING) {
          this.balanceDomainService.restorePendingBalance(
            balance,
            leave.duration.days,
            command.performedBy,
          );
        } else if (currentStatus === LeaveStatus.APPROVED) {
          this.balanceDomainService.restoreUsedBalance(
            balance,
            leave.duration.days,
            command.performedBy,
          );
        }
      }

      await this.unitOfWork.withTransaction(async () => {
        await this.leaveRequestRepository.save(leave);
        if (balance) {
          await this.leaveBalanceRepository.save(balance);
        }
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
