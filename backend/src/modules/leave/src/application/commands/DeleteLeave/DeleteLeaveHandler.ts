import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteLeaveCommand } from './DeleteLeaveCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(DeleteLeaveCommand)
@Injectable()
export class DeleteLeaveHandler implements ICommandHandler<DeleteLeaveCommand> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(command: DeleteLeaveCommand): Promise<Result<void>> {
    try {
      const leave = await this.leaveRequestRepository.findById(
        command.leaveRequestId,
      );
      if (!leave) return Result.fail<void>('Leave request not found');
      if (leave.companyId.toString() !== command.companyId)
        return Result.fail<void>('Unauthorized');

      // softDelete() internally emits LeaveDeletedEvent
      leave.softDelete(command.performedBy);

      await this.unitOfWork.withTransaction(async () => {
        await this.leaveRequestRepository.save(leave);
      });

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
