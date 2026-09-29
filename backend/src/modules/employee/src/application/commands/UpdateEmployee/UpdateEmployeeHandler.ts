import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from './UpdateEmployeeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { EmployeeDomainService } from '../../../domain/services/EmployeeDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { EmployeeNotFoundException } from '../../../domain/exceptions/EmployeeExceptions';
import { IEmploymentHistoryRepository } from '../../../domain/repositories/IEmploymentHistoryRepository';
import { EmploymentHistoryEntity } from '../../../domain/entities/EmploymentHistoryEntity';
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
      const employee = await this.employeeRepository.findById(command.employeeId);
      if (!employee) throw new EmployeeNotFoundException(command.employeeId);
      this.employeeDomainService.assertNotDeleted(employee);
      this.employeeDomainService.assertBelongsToCompany(employee, command.companyId);

      // Validate reportsTo cannot be self
      if (command.reportsToId && command.reportsToId === command.employeeId) {
        throw new BadRequestException('An employee cannot report to themselves.');
      }

      // Validate salary non-negative
      if (command.salary !== undefined && command.salary !== null && Number(command.salary) < 0) {
        throw new BadRequestException('Salary cannot be negative.');
      }

      // Check foreign keys
      if (command.departmentId) {
        const dept = await this.prisma.department.findFirst({
          where: { id: command.departmentId, companyId: command.companyId, isDeleted: false },
        });
        if (!dept) throw new NotFoundException('Department not found in this company.');
      }
      if (command.designationId) {
        const desg = await this.prisma.designation.findFirst({
          where: { id: command.designationId, companyId: command.companyId, isDeleted: false },
        });
        if (!desg) throw new NotFoundException('Designation not found in this company.');
      }
      if (command.branchId) {
        const branch = await this.prisma.branch.findFirst({
          where: { id: command.branchId, companyId: command.companyId, isDeleted: false },
        });
        if (!branch) throw new NotFoundException('Branch not found in this company.');
      }
      if (command.reportsToId) {
        const manager = await this.prisma.employee.findFirst({
          where: { id: command.reportsToId, companyId: command.companyId, isDeleted: false },
        });
        if (!manager) throw new NotFoundException('Reporting manager not found in this company.');
      }

      // Check duplicate employeeNumber
      if (command.employeeNumber && command.employeeNumber !== employee.employeeNumber) {
        const duplicateNumber = await this.prisma.employee.findFirst({
          where: {
            companyId: command.companyId,
            employeeNumber: command.employeeNumber,
            id: { not: command.employeeId },
            isDeleted: false,
          },
        });
        if (duplicateNumber) {
          throw new ConflictException(
            `Employee number '${command.employeeNumber}' is already in use by another employee.`,
          );
        }
      }

      // Check duplicate email
      if (command.personalEmail) {
        const email = command.personalEmail.trim().toLowerCase();
        const duplicateEmail = await this.prisma.employee.findFirst({
          where: {
            companyId: command.companyId,
            id: { not: command.employeeId },
            isDeleted: false,
            profile: { personalEmail: email },
          },
        });
        if (duplicateEmail) {
          throw new ConflictException(
            `Email '${email}' is already in use by another employee in your company.`,
          );
        }
      }

      // Update aggregate
      employee.update(
        command.departmentId,
        command.designationId,
        command.branchId,
        command.reportsToId,
        command.employeeNumber,
        command.performedBy,
        command.employmentType,
        command.salary !== undefined && command.salary !== null ? Number(command.salary) : undefined,
        command.joinedDate ? new Date(command.joinedDate) : undefined,
      );

      const changeSets = employee.changeSets;

      // Prepare profile updates
      const profileUpdates: any = {};
      if (command.firstName !== undefined) profileUpdates.firstName = command.firstName.trim();
      if (command.lastName !== undefined) profileUpdates.lastName = command.lastName.trim();
      if (command.personalEmail !== undefined) profileUpdates.personalEmail = command.personalEmail.trim().toLowerCase();
      if (command.phone !== undefined) profileUpdates.phone = command.phone?.trim() || null;
      if (command.address !== undefined) profileUpdates.address = command.address?.trim() || null;
      if (command.dateOfBirth !== undefined) profileUpdates.dateOfBirth = command.dateOfBirth ? new Date(command.dateOfBirth) : null;
      if (command.gender !== undefined) profileUpdates.gender = command.gender?.trim() || null;

      await this.unitOfWork.withTransaction(async () => {
        // Save employee aggregate
        await this.employeeRepository.save(employee);

        // Save profile updates if any
        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updatedBy = command.performedBy;
          profileUpdates.updatedAt = new Date();
          await this.prisma.profile.update({
            where: { id: employee.profileId },
            data: profileUpdates,
          });
        }

        // Record history
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

        // Update dynamic fields if provided
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
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof EmployeeNotFoundException
      ) {
        throw error;
      }
      return Result.fail<void>(error.message);
    }
  }
}
