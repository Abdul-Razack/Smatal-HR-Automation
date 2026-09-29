import { Injectable, Inject, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmployeeCommand } from './CreateEmployeeCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository';
import { IEmploymentHistoryRepository } from '../../../domain/repositories/IEmploymentHistoryRepository';
import { EmploymentHistoryEntity } from '../../../domain/entities/EmploymentHistoryEntity';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { EmployeeAggregate } from '../../../domain/aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../../../domain/enums/EmployeeStatus';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { EmployeeMapper } from '../../../infrastructure/mappers/EmployeeMapper';
import { EmployeeResponseDto } from '../../dto/responses/EmployeeResponseDto';

@CommandHandler(CreateEmployeeCommand)
@Injectable()
export class CreateEmployeeHandler implements ICommandHandler<CreateEmployeeCommand> {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    @Inject('IEmploymentHistoryRepository')
    private readonly employmentHistoryRepository: IEmploymentHistoryRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly businessIdGenerator: IBusinessIdGenerator,
    private readonly prisma: PrismaService,
    private readonly mapper: EmployeeMapper,
  ) {}

  async execute(command: CreateEmployeeCommand): Promise<Result<EmployeeResponseDto>> {
    try {
      // 1. Basic validation
      if (!command.firstName || !command.firstName.trim()) {
        throw new BadRequestException('First name is required.');
      }
      if (!command.lastName || !command.lastName.trim()) {
        throw new BadRequestException('Last name is required.');
      }
      if (!command.personalEmail || !command.personalEmail.trim()) {
        throw new BadRequestException('Email is required.');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(command.personalEmail.trim())) {
        throw new BadRequestException('Valid email address is required.');
      }
      if (!command.joinedDate) {
        throw new BadRequestException('Joining date is required.');
      }
      if (command.salary !== undefined && command.salary !== null && Number(command.salary) < 0) {
        throw new BadRequestException('Salary cannot be negative.');
      }

      const email = command.personalEmail.trim().toLowerCase();

      // 2. Tenant isolation & duplicate validation
      // Check if this email is already an active/non-deleted employee in THIS company
      const existingEmployeeWithEmail = await this.prisma.employee.findFirst({
        where: {
          companyId: command.companyId,
          isDeleted: false,
          profile: { personalEmail: email },
        },
      });
      if (existingEmployeeWithEmail) {
        throw new ConflictException(`An employee with email '${email}' already exists in your company.`);
      }

      // Check employeeNumber uniqueness within this company
      const empNumToCheck = command.employeeNumber?.trim();
      if (empNumToCheck) {
        const existingEmployeeWithNumber = await this.prisma.employee.findFirst({
          where: {
            companyId: command.companyId,
            employeeNumber: empNumToCheck,
            isDeleted: false,
          },
        });
        if (existingEmployeeWithNumber) {
          throw new ConflictException(
            `An employee with employee number '${empNumToCheck}' already exists in your company.`,
          );
        }
      }

      // 3. Organization FK validation
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

      // 4. Find or create Profile
      let profile = await this.prisma.profile.findFirst({
        where: { personalEmail: email },
      });

      const profileData: any = {
        firstName: command.firstName.trim(),
        lastName: command.lastName.trim(),
        personalEmail: email,
        phone: command.phone?.trim() || null,
        address: command.address?.trim() || null,
        gender: command.gender?.trim() || null,
        dateOfBirth: command.dateOfBirth ? new Date(command.dateOfBirth) : null,
        updatedBy: command.performedBy,
        updatedAt: new Date(),
      };

      if (!profile) {
        profile = await this.prisma.profile.create({
          data: {
            ...profileData,
            createdBy: command.performedBy,
          },
        });
      } else {
        profile = await this.prisma.profile.update({
          where: { id: profile.id },
          data: profileData,
        });
      }

      // 5. Generate unique sequential business ID (EMP_000001)
      const businessId = await this.businessIdGenerator.generate('EMP');
      const employeeNumber = empNumToCheck || businessId;
      const employeeId = new Identifier<string>(crypto.randomUUID());

      // 6. Create Employee Aggregate
      const employee = EmployeeAggregate.create(
        {
          businessId,
          companyId: new Identifier<string>(command.companyId),
          profileId: profile.id,
          status: command.status ?? EmployeeStatus.ACTIVE,
          joinedDate: new Date(command.joinedDate),
          departmentId: command.departmentId ?? null,
          designationId: command.designationId ?? null,
          branchId: command.branchId ?? null,
          reportsToId: command.reportsToId ?? null,
          employeeNumber,
          employmentType: command.employmentType?.trim() || null,
          salary: command.salary !== undefined && command.salary !== null ? Number(command.salary) : null,
          confirmationDate: command.status === EmployeeStatus.ACTIVE ? new Date() : null,
          probationEndDate: command.probationEndDate ? new Date(command.probationEndDate) : null,
          terminationDate: null,
          version: 1,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        employeeId,
        command.performedBy,
      );

      // 7. Atomic transaction persistence
      await this.unitOfWork.withTransaction(async () => {
        await this.employeeRepository.save(employee);

        const historyRecord = EmploymentHistoryEntity.create({
          employeeId: employee.id.toString(),
          companyId: employee.companyId,
          changeType: 'JOINED',
          previousValue: null,
          newValue: employee.status,
          effectiveDate: employee.joinedDate,
          createdAt: new Date(),
          createdBy: command.performedBy,
        });
        await this.employmentHistoryRepository.save(historyRecord);

        // Optional dynamic fields
        if (command.dynamicFields && command.dynamicFields.length > 0) {
          for (const df of command.dynamicFields) {
            await this.prisma.fieldValue.create({
              data: {
                companyId: command.companyId,
                entityType: 'EMPLOYEE',
                entityId: employee.id.toString(),
                employeeId: employee.id.toString(),
                profileId: profile.id,
                fieldDefinitionId: df.fieldDefinitionId,
                valueData: df.value,
                createdBy: command.performedBy,
                updatedBy: command.performedBy,
              },
            });
          }
        }
      });

      // 8. Return response DTO
      const dto = this.mapper.toResponseDto(employee);
      dto.profile = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        personalEmail: profile.personalEmail,
        phone: profile.phone,
        address: profile.address,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        profilePhoto: profile.profilePhoto,
      };

      return Result.ok(dto);
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      return Result.fail(error.message);
    }
  }
}
