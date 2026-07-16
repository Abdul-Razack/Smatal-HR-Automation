import { Injectable, Inject } from '@nestjs/common';
import {
  CommandHandler,
  ICommandHandler,
  CommandBus,
  EventBus,
} from '@nestjs/cqrs';
import { EscalateLeaveCommand } from './EscalateLeaveCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { ApproveWorkflowStageCommand } from '../../../../../workflow/src/application/commands/ApproveWorkflowStage/ApproveWorkflowStageCommand';
import { LeaveEscalatedEvent } from '../../../domain/events/LeaveEvents';

@CommandHandler(EscalateLeaveCommand)
@Injectable()
export class EscalateLeaveHandler implements ICommandHandler<EscalateLeaveCommand> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: EscalateLeaveCommand): Promise<Result<void>> {
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

      // Escalate essentially approves the current stage and forces it to the next
      const workflowResult = await this.commandBus.execute(
        new ApproveWorkflowStageCommand(
          command.workflowInstanceId,
          command.companyId,
          command.performedBy,
          `[ESCALATED] ${command.remarks ?? ''}`,
        ),
      );

      if (workflowResult.isFailure) {
        return Result.fail<void>(workflowResult.error);
      }

      this.eventBus.publish(
        new LeaveEscalatedEvent(
          leave.id.toString(),
          leave.companyId.toString(),
          command.performedBy,
        ),
      );

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
