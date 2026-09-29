import { UpdateEmployeeHandler } from '../../src/application/commands/UpdateEmployee/UpdateEmployeeHandler';
import { UpdateEmployeeCommand } from '../../src/application/commands/UpdateEmployee/UpdateEmployeeCommand';
import { EmployeeAggregate } from '../../src/domain/aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../../src/domain/enums/EmployeeStatus';
import { Identifier } from '../../../../kernel/domain/Identifier';
import { EmployeeDomainService } from '../../src/domain/services/EmployeeDomainService';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { EmployeeNotFoundException } from '../../src/domain/exceptions/EmployeeExceptions';

describe('UpdateEmployeeHandler', () => {
  let handler: UpdateEmployeeHandler;
  let mockEmployeeRepo: any;
  let mockHistoryRepo: any;
  let mockUow: any;
  let mockPrisma: any;
  let employeeDomainService: EmployeeDomainService;

  const createTestEmployee = (companyId = 'company-tenant-1') => {
    return EmployeeAggregate.create(
      {
        businessId: 'EMP_000001',
        companyId: new Identifier<string>(companyId),
        profileId: 'profile-uuid-1',
        status: EmployeeStatus.ACTIVE,
        joinedDate: new Date('2025-01-01'),
        departmentId: null,
        designationId: null,
        branchId: null,
        reportsToId: null,
        employeeNumber: 'EMP-001',
        employmentType: 'Full-time',
        salary: 50000,
        confirmationDate: new Date('2025-01-01'),
        probationEndDate: null,
        terminationDate: null,
        version: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-admin-1',
        updatedBy: 'user-admin-1',
      },
      new Identifier<string>('employee-uuid-1'),
      'user-admin-1',
    );
  };

  beforeEach(() => {
    mockEmployeeRepo = {
      findById: jest.fn().mockImplementation((id: string) => {
        if (id === 'employee-uuid-1') return Promise.resolve(createTestEmployee());
        return Promise.resolve(null);
      }),
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockHistoryRepo = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockUow = {
      withTransaction: jest.fn().mockImplementation(async (cb) => await cb()),
    };
    mockPrisma = {
      employee: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      profile: {
        update: jest.fn().mockResolvedValue({ id: 'profile-uuid-1' }),
      },
      department: {
        findFirst: jest.fn().mockResolvedValue({ id: 'dept-2' }),
      },
      designation: {
        findFirst: jest.fn().mockResolvedValue({ id: 'desg-2' }),
      },
      branch: {
        findFirst: jest.fn().mockResolvedValue({ id: 'branch-2' }),
      },
      fieldValue: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'fv-1' }),
      },
    };
    employeeDomainService = new EmployeeDomainService();

    handler = new UpdateEmployeeHandler(
      mockEmployeeRepo,
      mockHistoryRepo,
      mockUow,
      employeeDomainService,
      mockPrisma,
    );
  });

  it('should successfully update employee personal and employment information', async () => {
    const command = new UpdateEmployeeCommand(
      'employee-uuid-1',
      'company-tenant-1',
      'user-admin-1',
      'dept-2',
      'desg-2',
      'branch-2',
      undefined,
      'EMP-002',
      undefined,
      'Alice Updated',
      'Smith Updated',
      'alice.updated@example.com',
      '+9876543210',
      '456 Elm Street',
      new Date('1991-03-20'),
      'Female',
      'Part-time',
      65000,
      new Date('2025-01-15'),
    );

    const result = await handler.execute(command);
    expect(result.isSuccess).toBe(true);

    expect(mockEmployeeRepo.save).toHaveBeenCalledTimes(1);
    expect(mockPrisma.profile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'profile-uuid-1' },
        data: expect.objectContaining({
          firstName: 'Alice Updated',
          lastName: 'Smith Updated',
          personalEmail: 'alice.updated@example.com',
          phone: '+9876543210',
          address: '456 Elm Street',
        }),
      }),
    );
  });

  it('should reject update if employee belongs to a different tenant (tenant isolation)', async () => {
    const command = new UpdateEmployeeCommand(
      'employee-uuid-1',
      'other-rogue-tenant',
      'user-admin-1',
    );

    await expect(handler.execute(command)).rejects.toThrow(EmployeeNotFoundException);
  });

  it('should reject update if employee tries to report to themselves', async () => {
    const command = new UpdateEmployeeCommand(
      'employee-uuid-1',
      'company-tenant-1',
      'user-admin-1',
      undefined,
      undefined,
      undefined,
      'employee-uuid-1', // self
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should reject update if salary is negative', async () => {
    const command = new UpdateEmployeeCommand(
      'employee-uuid-1',
      'company-tenant-1',
      'user-admin-1',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      -1000,
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should reject update if duplicate employeeNumber is used by another employee', async () => {
    mockPrisma.employee.findFirst.mockResolvedValueOnce({
      id: 'another-employee-id',
      employeeNumber: 'EMP-TAKEN',
    });

    const command = new UpdateEmployeeCommand(
      'employee-uuid-1',
      'company-tenant-1',
      'user-admin-1',
      undefined,
      undefined,
      undefined,
      undefined,
      'EMP-TAKEN',
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });
});
