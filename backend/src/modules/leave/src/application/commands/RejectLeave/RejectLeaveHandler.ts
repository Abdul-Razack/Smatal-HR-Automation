import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { RejectLeaveCommand } from './RejectLeaveCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { RejectWorkflowStageCommand } from '../../../../../workflow/src/application/commands/RejectWorkflowStage/RejectWorkflowStageCommand';

@CommandHandler(RejectLeaveCommand)
@Injectable()
export class RejectLeaveHandler implements ICommandHandler<RejectLeaveCommand> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RejectLeaveCommand): Promise<Result<void>> {
    try {
      const leave = await this.leaveRequestRepository.findById(
        command.leaveRequestId,
      );
      if (!leave) return Result.fail<void>('Leave request not found');
      if (leave.companyId.toString() !== command.companyId)
        return Result.fail<void>('Unauthorized');
      if (leave.workflowInstanceId?.toString() !== command.workflowInstanceId) {
        return Result.fail<void>('Workflow instance mismatch');
      }

      // Delegate to the Workflow Engine
      const workflowResult = await this.commandBus.execute(
        new RejectWorkflowStageCommand(
          command.workflowInstanceId,
          command.companyId,
          command.performedBy,
          command.reason,
        ),
      );

      if (workflowResult.isFailure) {
        return Result.fail<void>(workflowResult.error);
      }

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
