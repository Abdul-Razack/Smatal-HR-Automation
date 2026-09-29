import { CreateEmployeeHandler } from '../../src/application/commands/CreateEmployee/CreateEmployeeHandler';
import { CreateEmployeeCommand } from '../../src/application/commands/CreateEmployee/CreateEmployeeCommand';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EmployeeMapper } from '../../src/infrastructure/mappers/EmployeeMapper';
import { EmployeeStatus } from '../../src/domain/enums/EmployeeStatus';

describe('CreateEmployeeHandler', () => {
  let handler: CreateEmployeeHandler;
  let mockEmployeeRepo: any;
  let mockHistoryRepo: any;
  let mockUow: any;
  let mockBusinessIdGen: any;
  let mockPrisma: any;
  let mapper: EmployeeMapper;

  beforeEach(() => {
    mockEmployeeRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
    };
    mockHistoryRepo = {
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockUow = {
      withTransaction: jest.fn().mockImplementation(async (cb) => await cb()),
    };
    mockBusinessIdGen = {
      generate: jest.fn().mockResolvedValue('EMP_000042'),
    };
    mockPrisma = {
      employee: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      profile: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 'profile-uuid-1', ...data }),
        ),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 'profile-uuid-1', ...data }),
        ),
      },
      department: {
        findFirst: jest.fn().mockResolvedValue({ id: 'dept-1' }),
      },
      designation: {
        findFirst: jest.fn().mockResolvedValue({ id: 'desg-1' }),
      },
      branch: {
        findFirst: jest.fn().mockResolvedValue({ id: 'branch-1' }),
      },
      fieldValue: {
        create: jest.fn().mockResolvedValue({ id: 'fv-1' }),
      },
    };
    mapper = new EmployeeMapper();

    handler = new CreateEmployeeHandler(
      mockEmployeeRepo,
      mockHistoryRepo,
      mockUow,
      mockBusinessIdGen,
      mockPrisma,
      mapper,
    );
  });

  it('should successfully create an employee directly with valid data', async () => {
    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      'Alice',
      'Smith',
      'alice.smith@example.com',
      new Date('2025-02-01'),
      '+1234567890',
      '123 Maple Street',
      new Date('1992-04-10'),
      'Female',
      'dept-1',
      'desg-1',
      'branch-1',
      undefined,
      'EMP-101',
      'Full-time',
      85000,
      EmployeeStatus.ACTIVE,
    );

    const result = await handler.execute(command);
    expect(result.isSuccess).toBe(true);

    const employeeDto = result.getValue();
    expect(employeeDto.businessId).toBe('EMP_000042');
    expect(employeeDto.employeeNumber).toBe('EMP-101');
    expect(employeeDto.companyId).toBe('company-tenant-1');
    expect(employeeDto.status).toBe(EmployeeStatus.ACTIVE);
    expect(employeeDto.employmentType).toBe('Full-time');
    expect(employeeDto.salary).toBe(85000);
    expect(employeeDto.profile?.firstName).toBe('Alice');
    expect(employeeDto.profile?.lastName).toBe('Smith');
    expect(employeeDto.profile?.personalEmail).toBe('alice.smith@example.com');
    expect(employeeDto.profile?.address).toBe('123 Maple Street');

    expect(mockEmployeeRepo.save).toHaveBeenCalledTimes(1);
    expect(mockHistoryRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should reject creation when first name or last name is missing', async () => {
    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      '',
      'Smith',
      'alice.smith@example.com',
      new Date('2025-02-01'),
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should reject creation when email format is invalid', async () => {
    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      'Alice',
      'Smith',
      'invalid-email-address',
      new Date('2025-02-01'),
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should reject creation when salary is negative', async () => {
    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      'Alice',
      'Smith',
      'alice.smith@example.com',
      new Date('2025-02-01'),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'Full-time',
      -500,
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should reject creation when email already exists for another active employee in the same company', async () => {
    mockPrisma.employee.findFirst.mockResolvedValueOnce({
      id: 'existing-emp-id',
      companyId: 'company-tenant-1',
    });

    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      'Alice',
      'Smith',
      'alice.smith@example.com',
      new Date('2025-02-01'),
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('should reject creation when employeeNumber already exists in the same company', async () => {
    // 1st call for email check passes (null), 2nd call for employeeNumber check finds duplicate
    mockPrisma.employee.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: 'other-emp-id',
        employeeNumber: 'EMP-DUPLICATE',
      });

    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      'Alice',
      'Smith',
      'alice.smith@example.com',
      new Date('2025-02-01'),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'EMP-DUPLICATE',
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });

  it('should reject creation if department does not belong to the company', async () => {
    mockPrisma.department.findFirst.mockResolvedValueOnce(null);

    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      'Alice',
      'Smith',
      'alice.smith@example.com',
      new Date('2025-02-01'),
      undefined,
      undefined,
      undefined,
      undefined,
      'non-existent-dept',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should reuse existing profile if email exists in another tenant without duplicating profile', async () => {
    mockPrisma.profile.findFirst.mockResolvedValueOnce({
      id: 'shared-profile-id',
      firstName: 'Alice',
      lastName: 'Smith',
      personalEmail: 'alice.smith@example.com',
    });

    const command = new CreateEmployeeCommand(
      'company-tenant-1',
      'user-admin-1',
      'Alice',
      'Smith',
      'alice.smith@example.com',
      new Date('2025-02-01'),
    );

    const result = await handler.execute(command);
    expect(result.isSuccess).toBe(true);
    expect(mockPrisma.profile.create).not.toHaveBeenCalled();
    expect(mockPrisma.profile.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'shared-profile-id' } }),
    );
  });
});
