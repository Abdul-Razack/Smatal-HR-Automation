import { EmployeeAggregate } from '../../src/domain/aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../../src/domain/enums/EmployeeStatus';
import { Identifier } from '../../../../kernel/domain/Identifier';
import { InvalidEmployeeStatusTransitionException, EmployeeNotFoundException } from '../../src/domain/exceptions/EmployeeExceptions';
import { TransitionLifecycleHandler } from '../../src/application/commands/TransitionLifecycle/TransitionLifecycleHandler';
import { TransitionLifecycleCommand } from '../../src/application/commands/TransitionLifecycle/TransitionLifecycleCommand';
import { EmployeeDomainService } from '../../src/domain/services/EmployeeDomainService';

describe('Employee Lifecycle Management', () => {
  const makeEmployee = (
    status: EmployeeStatus = EmployeeStatus.OFFER,
    joinedDate: Date = new Date('2025-01-01'),
    companyId: string = 'company-1',
  ): EmployeeAggregate => {
    return EmployeeAggregate.create(
      {
        businessId: 'EMP_000001',
        companyId: new Identifier<string>(companyId),
        profileId: 'profile-1',
        status,
        joinedDate,
        departmentId: null,
        designationId: null,
        branchId: null,
        reportsToId: null,
        employeeNumber: 'EMP-01',
        confirmationDate: null,
        probationEndDate: null,
        resignationDate: null,
        lastWorkingDate: null,
        noticePeriodDays: null,
        terminationDate: null,
        version: 1,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      },
      new Identifier<string>('employee-1'),
      'user-1',
    );
  };

  describe('Domain Lifecycle Transitions', () => {
    it('should complete the entire sequential lifecycle: OFFER → JOINED → PROBATION → CONFIRMED → NOTICE_PERIOD → RELIEVED', () => {
      const emp = makeEmployee(EmployeeStatus.OFFER);
      expect(emp.status).toBe(EmployeeStatus.OFFER);

      // 1. OFFER → JOINED
      emp.transitionLifecycle(EmployeeStatus.JOINED, 'user-1', {
        effectiveDate: new Date('2025-01-01'),
      });
      expect(emp.status).toBe(EmployeeStatus.JOINED);
      expect(emp.joinedDate).toEqual(new Date('2025-01-01'));

      // 2. JOINED → PROBATION
      const probationEnd = new Date('2025-04-01');
      emp.transitionLifecycle(EmployeeStatus.PROBATION, 'user-1', {
        probationEndDate: probationEnd,
        notes: 'Probation period set to 3 months',
      });
      expect(emp.status).toBe(EmployeeStatus.PROBATION);
      expect(emp.probationEndDate).toEqual(probationEnd);

      // 3. PROBATION → CONFIRMED
      const confirmationDate = new Date('2025-04-01');
      emp.transitionLifecycle(EmployeeStatus.CONFIRMED, 'user-1', {
        confirmationDate,
        notes: 'Performance review cleared. Confirmed.',
      });
      expect(emp.status).toBe(EmployeeStatus.CONFIRMED);
      expect(emp.confirmationDate).toEqual(confirmationDate);

      // 4. CONFIRMED → NOTICE_PERIOD
      const resignationDate = new Date('2025-08-01');
      const lastWorkingDate = new Date('2025-09-01');
      emp.transitionLifecycle(EmployeeStatus.NOTICE_PERIOD, 'user-1', {
        resignationDate,
        lastWorkingDate,
        noticePeriodDays: 30,
        notes: 'Submitted resignation for personal reasons',
      });
      expect(emp.status).toBe(EmployeeStatus.NOTICE_PERIOD);
      expect(emp.resignationDate).toEqual(resignationDate);
      expect(emp.lastWorkingDate).toEqual(lastWorkingDate);
      expect(emp.noticePeriodDays).toBe(30);

      // 5. NOTICE_PERIOD → RELIEVED
      emp.transitionLifecycle(EmployeeStatus.RELIEVED, 'user-1', {
        lastWorkingDate,
        notes: 'Handover complete. Relieved.',
      });
      expect(emp.status).toBe(EmployeeStatus.RELIEVED);
      expect(emp.lastWorkingDate).toEqual(lastWorkingDate);
    });

    it('should reject invalid jumps (e.g. JOINED → RELIEVED)', () => {
      const emp = makeEmployee(EmployeeStatus.JOINED);
      expect(() => {
        emp.transitionLifecycle(EmployeeStatus.RELIEVED, 'user-1');
      }).toThrow(InvalidEmployeeStatusTransitionException);
      expect(emp.status).toBe(EmployeeStatus.JOINED);
    });

    it('should reject invalid jumps (e.g. PROBATION → RELIEVED)', () => {
      const emp = makeEmployee(EmployeeStatus.PROBATION);
      expect(() => {
        emp.transitionLifecycle(EmployeeStatus.RELIEVED, 'user-1');
      }).toThrow(InvalidEmployeeStatusTransitionException);
      expect(emp.status).toBe(EmployeeStatus.PROBATION);
    });

    it('should reject invalid jumps (e.g. OFFER → CONFIRMED)', () => {
      const emp = makeEmployee(EmployeeStatus.OFFER);
      expect(() => {
        emp.transitionLifecycle(EmployeeStatus.CONFIRMED, 'user-1');
      }).toThrow(InvalidEmployeeStatusTransitionException);
      expect(emp.status).toBe(EmployeeStatus.OFFER);
    });

    it('should reject transitions from terminal state RELIEVED', () => {
      const emp = makeEmployee(EmployeeStatus.RELIEVED);
      expect(() => {
        emp.transitionLifecycle(EmployeeStatus.CONFIRMED, 'user-1');
      }).toThrow(InvalidEmployeeStatusTransitionException);
      expect(emp.status).toBe(EmployeeStatus.RELIEVED);
    });

    it('should reject confirmationDate earlier than joinedDate', () => {
      const emp = makeEmployee(EmployeeStatus.PROBATION, new Date('2025-06-01'));
      expect(() => {
        emp.transitionLifecycle(EmployeeStatus.CONFIRMED, 'user-1', {
          confirmationDate: new Date('2025-05-01'), // earlier than joinedDate
        });
      }).toThrow('Confirmation date cannot be earlier than joining date');
      expect(emp.status).toBe(EmployeeStatus.PROBATION);
    });

    it('should reject lastWorkingDate earlier than resignationDate', () => {
      const emp = makeEmployee(EmployeeStatus.CONFIRMED, new Date('2025-01-01'));
      expect(() => {
        emp.transitionLifecycle(EmployeeStatus.NOTICE_PERIOD, 'user-1', {
          resignationDate: new Date('2025-08-15'),
          lastWorkingDate: new Date('2025-08-10'), // earlier than resignationDate
        });
      }).toThrow('Last working date cannot be earlier than resignation date');
      expect(emp.status).toBe(EmployeeStatus.CONFIRMED);
    });

    it('should reject probationEndDate earlier than joinedDate', () => {
      const emp = makeEmployee(EmployeeStatus.JOINED, new Date('2025-06-01'));
      expect(() => {
        emp.transitionLifecycle(EmployeeStatus.PROBATION, 'user-1', {
          probationEndDate: new Date('2025-05-01'), // earlier than joinedDate
        });
      }).toThrow('Probation end date cannot be earlier than joining date');
      expect(emp.status).toBe(EmployeeStatus.JOINED);
    });
  });

  describe('TransitionLifecycleHandler', () => {
    let handler: TransitionLifecycleHandler;
    let mockEmployeeRepo: any;
    let mockHistoryRepo: any;
    let mockUow: any;
    let employeeDomainService: EmployeeDomainService;

    beforeEach(() => {
      mockEmployeeRepo = {
        findById: jest.fn(),
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockHistoryRepo = {
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockUow = {
        withTransaction: jest.fn().mockImplementation(async (cb) => await cb()),
      };
      employeeDomainService = new EmployeeDomainService();

      handler = new TransitionLifecycleHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        employeeDomainService,
      );
    });

    it('should successfully transition status and record history', async () => {
      const emp = makeEmployee(EmployeeStatus.PROBATION, new Date('2025-01-01'), 'company-1');
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      const command = new TransitionLifecycleCommand(
        'employee-1',
        'company-1',
        'hr-user-id',
        EmployeeStatus.CONFIRMED,
        new Date('2025-04-01'),
        undefined,
        new Date('2025-04-01'),
        undefined,
        undefined,
        undefined,
        'Probation passed successfully',
      );

      const result = await handler.execute(command);
      expect(result.isSuccess).toBe(true);
      expect(emp.status).toBe(EmployeeStatus.CONFIRMED);
      expect(mockEmployeeRepo.save).toHaveBeenCalledWith(emp);
      expect(mockHistoryRepo.save).toHaveBeenCalledTimes(1);

      const savedHistory = mockHistoryRepo.save.mock.calls[0][0];
      expect(savedHistory.changeType).toBe('STATUS_CHANGED');
      expect(savedHistory.previousValue).toBe(EmployeeStatus.PROBATION);
      expect(savedHistory.newValue).toBe(EmployeeStatus.CONFIRMED);
      expect(savedHistory.notes).toBe('Probation passed successfully');
      expect(savedHistory.createdBy).toBe('hr-user-id');
    });

    it('should reject cross-tenant lifecycle transition attempt', async () => {
      // Employee belongs to company-2, caller belongs to company-1
      const emp = makeEmployee(EmployeeStatus.PROBATION, new Date('2025-01-01'), 'company-2');
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      const command = new TransitionLifecycleCommand(
        'employee-1',
        'company-1', // different company!
        'attacker-user',
        EmployeeStatus.CONFIRMED,
      );

      const result = await handler.execute(command);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('employee-1');
      expect(emp.status).toBe(EmployeeStatus.PROBATION); // unchanged
      expect(mockEmployeeRepo.save).not.toHaveBeenCalled();
      expect(mockHistoryRepo.save).not.toHaveBeenCalled();
    });

    it('should reject non-existent employee', async () => {
      mockEmployeeRepo.findById.mockResolvedValue(null);

      const command = new TransitionLifecycleCommand(
        'unknown-emp',
        'company-1',
        'hr-user',
        EmployeeStatus.CONFIRMED,
      );

      const result = await handler.execute(command);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('unknown-emp');
    });

    it('should reject invalid transition and not save any changes', async () => {
      const emp = makeEmployee(EmployeeStatus.JOINED, new Date('2025-01-01'), 'company-1');
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      const command = new TransitionLifecycleCommand(
        'employee-1',
        'company-1',
        'hr-user',
        EmployeeStatus.RELIEVED, // Invalid jump!
      );

      const result = await handler.execute(command);
      expect(result.isFailure).toBe(true);
      expect(emp.status).toBe(EmployeeStatus.JOINED);
      expect(mockEmployeeRepo.save).not.toHaveBeenCalled();
      expect(mockHistoryRepo.save).not.toHaveBeenCalled();
    });
  });
});
