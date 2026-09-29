import { Injectable, Inject, Optional, BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateClearanceCommand } from './UpdateClearanceCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { ClearanceDepartment, ClearanceStatus } from '../../../domain/enums/ResignationEnums';

@CommandHandler(UpdateClearanceCommand)
@Injectable()
export class UpdateClearanceHandler
  implements ICommandHandler<UpdateClearanceCommand>
{
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    private readonly employeeDomainService: EmployeeDomainService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async execute(command: UpdateClearanceCommand): Promise<Result<void>> {
    try {
      const employee = await this.employeeRepository.findById(command.employeeId);
      if (!employee) {
        throw new EmployeeNotFoundException(command.employeeId);
      }

      this.employeeDomainService.assertNotDeleted(employee);
      this.employeeDomainService.assertBelongsToCompany(employee, command.companyId);

      const validDepts = Object.values(ClearanceDepartment);
      if (!validDepts.includes(command.department)) {
        throw new BadRequestException(`Invalid clearance department: ${command.department}`);
      }

      const validStatuses = Object.values(ClearanceStatus);
      if (!validStatuses.includes(command.status)) {
        throw new BadRequestException(`Invalid clearance status: ${command.status}`);
      }

      if (this.prisma) {
        const isCleared = command.status === ClearanceStatus.CLEARED || command.status === ClearanceStatus.NOT_APPLICABLE;
        await (this.prisma as any).exitClearance.upsert({
          where: {
            employeeId_department: {
              employeeId: employee.id.toString(),
              department: command.department,
            },
          },
          create: {
            employeeId: employee.id.toString(),
            companyId: employee.companyId.toString(),
            department: command.department,
            status: command.status,
            remarks: command.remarks ?? null,
            clearedBy: isCleared ? command.performedBy : null,
            clearedAt: isCleared ? new Date() : null,
            createdBy: command.performedBy,
            updatedBy: command.performedBy,
          },
          update: {
            status: command.status,
            remarks: command.remarks ?? undefined,
            clearedBy: isCleared ? command.performedBy : null,
            clearedAt: isCleared ? new Date() : null,
            updatedBy: command.performedBy,
          },
        });
      }

      return Result.ok<void>();
    } catch (error: any) {
      return Result.fail<void>(error.message);
    }
  }
}
