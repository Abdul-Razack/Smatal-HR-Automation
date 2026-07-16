import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApplyLeaveCommand } from './ApplyLeaveCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { ILeaveBalanceRepository } from '../../../domain/repositories/ILeaveBalanceRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { LeaveRequestAggregate } from '../../../domain/aggregates/LeaveRequestAggregate';
import { LeaveBalanceDomainService } from '../../../domain/services/LeaveBalanceDomainService';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { v4 as uuidv4 } from 'uuid';
import {
  LeaveStatus,
  LeaveDurationType,
} from '../../../domain/enums/LeaveEnums';
import { DateRange } from '../../../domain/value-objects/DateRange';
import { LeaveDuration } from '../../../domain/value-objects/LeaveDuration';

@CommandHandler(ApplyLeaveCommand)
@Injectable()
export class ApplyLeaveHandler implements ICommandHandler<ApplyLeaveCommand> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @Inject('ILeaveBalanceRepository')
    private readonly leaveBalanceRepository: ILeaveBalanceRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly balanceDomainService: LeaveBalanceDomainService,
  ) {}

  async execute(command: ApplyLeaveCommand): Promise<Result<void>> {
    try {
      const id = new Identifier<string>(uuidv4());
      const businessId = `LR_${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')}`;

      const dateRange = DateRange.create(
        new Date(command.startDate),
        new Date(command.endDate),
      );
      const durationType = command.isHalfDay
        ? LeaveDurationType.HALF_DAY
        : LeaveDurationType.FULL_DAY;
      const duration = LeaveDuration.create(
        command.durationDays ?? 1,
        durationType,
      );

      // LeaveRequestAggregate.create internally publishes LeaveAppliedEvent
      const leaveRequest = LeaveRequestAggregate.create(
        {
          businessId,
          companyId: new Identifier<string>(command.companyId),
          employeeId: new Identifier<string>(command.employeeId),
          leaveTypeId: new Identifier<string>(command.leaveTypeId),
          status: LeaveStatus.PENDING,
          dateRange,
          duration,
          reason: command.reason,
          attachmentUrl: command.attachmentUrl,
          version: 1,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        id,
        command.performedBy,
      );

      // 1. Check and hold balance
      const currentYear = new Date().getFullYear();
      const balance = await this.leaveBalanceRepository.findSpecificBalance(
        command.employeeId,
        command.leaveTypeId,
        currentYear,
      );

      if (balance) {
        this.balanceDomainService.holdPendingBalance(
          balance,
          duration.days,
          command.performedBy,
        );
      }

      await this.unitOfWork.withTransaction(async () => {
        await this.leaveRequestRepository.save(leaveRequest);
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
