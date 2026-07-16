import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLeaveByIdQuery } from './GetLeaveByIdQuery';
import { ILeaveRequestRepository } from '../../../domain/repositories/ILeaveRequestRepository';
import { LeaveResponseDto } from '../../dto/responses/LeaveResponses';
import { LeaveRequestMapper } from '../../../infrastructure/mappers/LeaveRequestMapper';

@QueryHandler(GetLeaveByIdQuery)
@Injectable()
export class GetLeaveByIdHandler implements IQueryHandler<GetLeaveByIdQuery> {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly leaveRequestRepository: ILeaveRequestRepository,
    private readonly leaveMapper: LeaveRequestMapper,
  ) {}

  async execute(query: GetLeaveByIdQuery): Promise<LeaveResponseDto | null> {
    const leave = await this.leaveRequestRepository.findById(
      query.leaveRequestId,
    );
    if (!leave) return null;
    if (leave.companyId.toString() !== query.companyId) return null;
    return this.leaveMapper.toResponseDto(leave);
  }
}
