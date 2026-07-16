import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLeaveCommand } from './UpdateLeaveCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { LeaveStatus } from '../../../domain/enums/LeaveEnums';
import { DateRange } from '../../../domain/value-objects/DateRange';

@CommandHandler(UpdateLeaveCommand)
@Injectable()
export class UpdateLeaveHandler implements ICommandHandler<UpdateLeaveCommand> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: UpdateLeaveCommand): Promise<Result<void>> {
    try {
      const leave = await this.leaveRequestRepository.findById(
        command.leaveRequestId,
      );
      if (!leave) return Result.fail<void>('Leave request not found');
      if (leave.companyId.toString() !== command.companyId)
        return Result.fail<void>('Unauthorized');
      if (leave.status !== LeaveStatus.PENDING)
        return Result.fail<void>('Only pending leaves can be updated');

      // Directly mutate the props (pattern used throughout the project)
      if (command.startDate && command.endDate) {
        leave.props.dateRange = DateRange.create(
          new Date(command.startDate),
          new Date(command.endDate),
        );
      }
      if (command.reason !== undefined) leave.props.reason = command.reason;
      if (command.attachmentUrl !== undefined)
        leave.props.attachmentUrl = command.attachmentUrl;

      leave.props.updatedBy = command.performedBy;
      leave.props.updatedAt = new Date();
      leave.props.version++;

      await this.unitOfWork.withTransaction(async () => {
        await this.leaveRequestRepository.save(leave);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
