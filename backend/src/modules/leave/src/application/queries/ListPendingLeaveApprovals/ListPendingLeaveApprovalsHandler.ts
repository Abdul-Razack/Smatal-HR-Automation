import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPendingLeaveApprovalsQuery } from './ListPendingLeaveApprovalsQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { IPaginatedResult } from '../../../../../../kernel/repositories/repository.contracts';
import { LeaveRequestAggregate } from '../../../domain/aggregates/LeaveRequestAggregate';
import { LeaveStatus } from '../../../domain/enums/LeaveEnums';

@QueryHandler(ListPendingLeaveApprovalsQuery)
@Injectable()
export class ListPendingLeaveApprovalsHandler implements IQueryHandler<ListPendingLeaveApprovalsQuery> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepo: ILeaveRequestRepository,
  ) {}

  async execute(
    query: ListPendingLeaveApprovalsQuery,
  ): Promise<Result<IPaginatedResult<LeaveRequestAggregate>>> {
    try {
      // For Phase 3, we just list PENDING leaves. In a fully mature system, we would join with
      // WorkflowInstance and WorkflowDefinition to filter by the exact approver Employee ID.
      const paginated = await this.leaveRequestRepo.listWithFilters(
        query.companyId,
        undefined, // We don't filter by employeeId of the requester, but we could filter by approver in a custom query
        LeaveStatus.PENDING,
        query.pagination,
        query.sort,
      );

      return Result.ok<IPaginatedResult<LeaveRequestAggregate>>(paginated);
    } catch (error: any) {
      return Result.fail<IPaginatedResult<LeaveRequestAggregate>>(
        error.message,
      );
    }
  }
}
