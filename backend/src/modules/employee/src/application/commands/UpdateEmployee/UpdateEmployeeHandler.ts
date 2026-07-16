import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from './UpdateEmployeeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { IEmploymentHistoryRepository } from '../../../domain/repositories/IEmploymentHistoryRepository';
import { EmploymentHistoryEntity } from '../../../domain/entities/EmploymentHistoryEntity';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@CommandHandler(UpdateEmployeeCommand)
@Injectable()
export class UpdateEmployeeHandler implements ICommandHandler<UpdateEmployeeCommand> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    @Inject('IEmploymentHistoryRepository')
    private readonly employmentHistoryRepository: IEmploymentHistoryRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    private readonly employeeDomainService: EmployeeDomainService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: UpdateEmployeeCommand): Promise<Result<void>> {
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

      employee.update(
        command.departmentId,
        command.designationId,
        command.branchId,
        command.reportsToId,
        command.employeeNumber,
        command.performedBy,
      );

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

        if (command.dynamicFields && command.dynamicFields.length > 0) {
          for (const df of command.dynamicFields) {
            const existingField = await this.prisma.fieldValue.findFirst({
              where: {
                employeeId: employee.id.toString(),
                fieldDefinitionId: df.fieldDefinitionId,
              },
            });

            if (existingField) {
              await this.prisma.fieldValue.update({
                where: { id: existingField.id },
                data: {
                  valueData: df.value,
                  updatedBy: command.performedBy,
                },
              });
            } else {
              await this.prisma.fieldValue.create({
                data: {
                  companyId: employee.companyId.toString(),
                  entityType: 'EMPLOYEE',
                  entityId: employee.id.toString(),
                  employeeId: employee.id.toString(),
                  profileId: employee.profileId,
                  fieldDefinitionId: df.fieldDefinitionId,
                  valueData: df.value,
                  createdBy: command.performedBy,
                  updatedBy: command.performedBy,
                },
              });
            }
          }
        }
      });
      
      employee.clearChangeSets();

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
