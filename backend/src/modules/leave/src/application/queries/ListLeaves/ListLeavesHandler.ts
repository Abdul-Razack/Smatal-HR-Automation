import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListLeavesQuery } from './ListLeavesQuery';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { IPaginatedResult } from '../../../../../../kernel/repositories/repository.contracts';
import { LeaveResponseDto } from '../../dto/responses/LeaveResponses';
import { LeaveRequestMapper } from '../../../infrastructure/mappers/LeaveRequestMapper';

@QueryHandler(ListLeavesQuery)
@Injectable()
export class ListLeavesHandler implements IQueryHandler<ListLeavesQuery> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly leaveMapper: LeaveRequestMapper,
  ) {}

  async execute(
    query: ListLeavesQuery,
  ): Promise<IPaginatedResult<LeaveResponseDto>> {
    const result = await this.leaveRequestRepository.listWithFilters(
      query.companyId,
      query.employeeId,
      query.status,
      { page: query.page, limit: query.limit },
      { field: query.sortField, direction: query.sortDirection },
    );
    return {
      ...result,
      data: result.data.map((e) => this.leaveMapper.toResponseDto(e)),
    };
  }
}
