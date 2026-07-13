import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetEmployeeQuery } from './GetEmployeeQuery';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { EmployeeResponseDto } from '../../dto/responses/EmployeeResponseDto';
import { EmployeeMapper } from '../../../infrastructure/mappers/EmployeeMapper';

@QueryHandler(GetEmployeeQuery)
@Injectable()
export class GetEmployeeHandler implements IQueryHandler<GetEmployeeQuery> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    private readonly employeeDomainService: EmployeeDomainService,
    private readonly employeeMapper: EmployeeMapper,
  ) {}

  async execute(query: GetEmployeeQuery): Promise<EmployeeResponseDto> {
    const employee = await this.employeeRepository.findById(query.employeeId);
    if (!employee) throw new EmployeeNotFoundException(query.employeeId);
    this.employeeDomainService.assertBelongsToCompany(
      employee,
      query.companyId,
    );
    return this.employeeMapper.toResponseDto(employee);
  }
}
