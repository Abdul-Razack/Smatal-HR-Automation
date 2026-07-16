import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListLeaveTypesQuery } from './ListLeaveTypesQuery';
import { ILeaveTypeRepository } from '../../../domain/repositories/ILeaveTypeRepository';
import { LeaveTypeResponseDto } from '../../dto/responses/LeaveResponses';
import { LeaveTypeMapper } from '../../../infrastructure/mappers/LeaveTypeMapper';

@QueryHandler(ListLeaveTypesQuery)
@Injectable()
export class ListLeaveTypesHandler implements IQueryHandler<ListLeaveTypesQuery> {
  constructor(
    @Inject('ILeaveTypeRepository')
    private readonly leaveTypeRepository: ILeaveTypeRepository,
    private readonly leaveTypeMapper: LeaveTypeMapper,
  ) {}

  async execute(query: ListLeaveTypesQuery): Promise<LeaveTypeResponseDto[]> {
    const types = await this.leaveTypeRepository.findByCompanyId(
      query.companyId,
    );
    return types.map((t) => this.leaveTypeMapper.toResponseDto(t));
  }
}
