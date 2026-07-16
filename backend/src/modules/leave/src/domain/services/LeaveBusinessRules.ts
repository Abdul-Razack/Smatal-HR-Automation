import { Injectable } from '@nestjs/common';
import { LeaveRequestAggregate } from '../aggregates/LeaveRequestAggregate';
import { LeavePolicy } from '../entities/LeavePolicy';

export class LeavePolicyValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeavePolicyValidationException';
  }
}

@Injectable()
export class LeaveBusinessRules {
  /**
   * Validates a leave request against the leave policy.
   */
  validateAgainstPolicy(
    leave: LeaveRequestAggregate,
    policy: LeavePolicy,
  ): void {
    if (!policy.isActive) {
      throw new LeavePolicyValidationException(
        `Leave policy '${policy.name}' is not active.`,
      );
    }

    if (policy.requiresAttachment) {
      const isAttachmentNeeded =
        policy.minDaysForAttachment !== null &&
        leave.duration.days >= policy.minDaysForAttachment;

      if (isAttachmentNeeded && !leave.attachmentUrl) {
        throw new LeavePolicyValidationException(
          `Attachment is required for ${policy.name} requests of ${policy.minDaysForAttachment} or more days.`,
        );
      }
    }

    // Additional policy validations (probation, advance notice, backdated, etc.) would go here.
    // Assuming we have fields on policy for notice period in the future, we would check:
    // const daysNotice = (leave.dateRange.startDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    // if (policy.advanceNoticeDays && daysNotice < policy.advanceNoticeDays) { ... }
  }

  /**
   * Validates that the leave request does not overlap with existing approved/pending leaves.
   */
  validateOverlaps(
    overlappingLeaves: LeaveRequestAggregate[],
    leaveRequestId?: string,
  ): void {
    const conflicts = overlappingLeaves.filter(
      (l) => l.id.toString() !== leaveRequestId,
    );
    if (conflicts.length > 0) {
      throw new LeavePolicyValidationException(
        `Leave request overlaps with existing pending or approved leave(s).`,
      );
    }
  }
}
