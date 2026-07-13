import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListEmployeesQuery } from './ListEmployeesQuery';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { IPaginatedResult } from '../../../../../../kernel/repositories/repository.contracts';
import { EmployeeResponseDto } from '../../dto/responses/EmployeeResponseDto';
import { EmployeeMapper } from '../../../infrastructure/mappers/EmployeeMapper';

@QueryHandler(ListEmployeesQuery)
@Injectable()
export class ListEmployeesHandler implements IQueryHandler<ListEmployeesQuery> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    private readonly employeeMapper: EmployeeMapper,
  ) {}

  async execute(
    query: ListEmployeesQuery,
  ): Promise<IPaginatedResult<EmployeeResponseDto>> {
    const result = await this.employeeRepository.listByCompany(
      query.companyId,
      query.status,
      query.departmentId,
      { page: query.page, limit: query.limit },
      { field: query.sortField, direction: query.sortDirection },
    );
    return {
      ...result,
      data: result.data.map((e) => this.employeeMapper.toResponseDto(e)),
    };
  }
}
