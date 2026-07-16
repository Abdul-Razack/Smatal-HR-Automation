import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ActivateEmployeeCommand } from './ActivateEmployeeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { IEmploymentHistoryRepository } from '../../../domain/repositories/IEmploymentHistoryRepository';
import { EmploymentHistoryEntity } from '../../../domain/entities/EmploymentHistoryEntity';

@CommandHandler(ActivateEmployeeCommand)
@Injectable()
export class ActivateEmployeeHandler implements ICommandHandler<ActivateEmployeeCommand> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    @Inject('IEmploymentHistoryRepository')
    private readonly employmentHistoryRepository: IEmploymentHistoryRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly employeeDomainService: EmployeeDomainService,
  ) {}

  async execute(command: ActivateEmployeeCommand): Promise<Result<void>> {
    try {
      const employee = await this.employeeRepository.findById(
        command.employeeId,
      );
      if (!employee) throw new EmployeeNotFoundException(command.employeeId);
      this.employeeDomainService.assertNotDeleted(employee);
      this.employeeDomainService.assertBelongsToCompany(
        employee,
        command.companyId,
      );
      this.employeeDomainService.assertCanBeActivated(employee);

      employee.activate(command.performedBy);
      
      const changeSets = employee.changeSets;

      await this.unitOfWork.withTransaction(async () => {
        await this.employeeRepository.save(employee);

        for (const change of changeSets) {
          const historyRecord = EmploymentHistoryEntity.create({
            employeeId: employee.id.toString(),
            companyId: employee.companyId,
            changeType: change.field,
            previousValue: change.previous,
            newValue: change.new,
            effectiveDate: new Date(),
            createdAt: new Date(),
            createdBy: command.performedBy,
          });
          await this.employmentHistoryRepository.save(historyRecord);
        }
      });

      employee.clearChangeSets();

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
