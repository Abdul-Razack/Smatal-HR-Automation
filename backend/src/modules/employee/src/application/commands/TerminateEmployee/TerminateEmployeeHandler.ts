import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TerminateEmployeeCommand } from './TerminateEmployeeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';

@CommandHandler(TerminateEmployeeCommand)
@Injectable()
export class TerminateEmployeeHandler implements ICommandHandler<TerminateEmployeeCommand> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly employeeDomainService: EmployeeDomainService,
  ) {}

  async execute(command: TerminateEmployeeCommand): Promise<Result<void>> {
    try {
      const employee = await this.employeeRepository.findById(
        command.employeeId,
      );
      if (!employee) throw new EmployeeNotFoundException(command.employeeId);
      this.employeeDomainService.assertBelongsToCompany(
        employee,
        command.companyId,
      );
      employee.terminate(
        command.terminationDate,
        command.reason,
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
