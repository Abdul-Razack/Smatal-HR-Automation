import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from './UpdateEmployeeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';

@CommandHandler(UpdateEmployeeCommand)
@Injectable()
export class UpdateEmployeeHandler implements ICommandHandler<UpdateEmployeeCommand> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly employeeDomainService: EmployeeDomainService,
  ) {}

  async execute(command: UpdateEmployeeCommand): Promise<Result<void>> {
    try {
      const employee = await this.employeeRepository.findById(
        command.employeeId,
      );
      if (!employee) throw new EmployeeNotFoundException(command.employeeId);
      this.employeeDomainService.assertBelongsToCompany(
        employee,
        command.companyId,
      );
      employee.update(
        command.departmentId,
        command.designationId,
        command.branchId,
        command.reportsToId,
        command.employeeNumber,
        command.performedBy,
      );
      await this.unitOfWork.withTransaction(async () => {
        await this.employeeRepository.save(employee);
      });
      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
