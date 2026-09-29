import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransitionLifecycleCommand } from './TransitionLifecycleCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { IEmploymentHistoryRepository } from '../../../domain/repositories/IEmploymentHistoryRepository';
import { EmploymentHistoryEntity } from '../../../domain/entities/EmploymentHistoryEntity';

@CommandHandler(TransitionLifecycleCommand)
@Injectable()
export class TransitionLifecycleHandler
  implements ICommandHandler<TransitionLifecycleCommand>
{
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    @Inject('IEmploymentHistoryRepository')
    private readonly employmentHistoryRepository: IEmploymentHistoryRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly employeeDomainService: EmployeeDomainService,
  ) {}

  async execute(command: TransitionLifecycleCommand): Promise<Result<void>> {
    try {
      const employee = await this.employeeRepository.findById(
        command.employeeId,
      );
      if (!employee) {
        throw new EmployeeNotFoundException(command.employeeId);
      }

      this.employeeDomainService.assertNotDeleted(employee);
      this.employeeDomainService.assertBelongsToCompany(
        employee,
        command.companyId,
      );

      // Perform lifecycle transition on aggregate (validates transition and dates)
      employee.transitionLifecycle(command.targetStatus, command.performedBy, {
        effectiveDate: command.effectiveDate,
        confirmationDate: command.confirmationDate,
        probationEndDate: command.probationEndDate,
        resignationDate: command.resignationDate,
        lastWorkingDate: command.lastWorkingDate,
        noticePeriodDays: command.noticePeriodDays,
        notes: command.notes,
      });

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
            effectiveDate: command.effectiveDate ?? new Date(),
            notes: command.notes,
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
