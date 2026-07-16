import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLeaveBalanceQuery } from './GetLeaveBalanceQuery';
import { ILeaveBalanceRepository } from '../../../domain/repositories/ILeaveBalanceRepository';
import { LeaveBalanceResponseDto } from '../../dto/responses/LeaveResponses';
import { LeaveBalanceMapper } from '../../../infrastructure/mappers/LeaveBalanceMapper';

@QueryHandler(GetLeaveBalanceQuery)
@Injectable()
export class GetLeaveBalanceHandler implements IQueryHandler<GetLeaveBalanceQuery> {
  constructor(
    @Inject('ILeaveBalanceRepository')
    private readonly leaveBalanceRepository: ILeaveBalanceRepository,
    private readonly leaveBalanceMapper: LeaveBalanceMapper,
  ) {}

  async execute(
    query: GetLeaveBalanceQuery,
  ): Promise<LeaveBalanceResponseDto[]> {
    const balances = await this.leaveBalanceRepository.findByEmployeeId(
      query.employeeId,
      query.year,
    );
    // Filter by companyId explicitly in memory just as a safeguard, or assume repo ensures it via employee
    return balances
      .filter((b) => b.companyId.toString() === query.companyId)
      .map((b) => this.leaveBalanceMapper.toResponseDto(b));
  }
}
