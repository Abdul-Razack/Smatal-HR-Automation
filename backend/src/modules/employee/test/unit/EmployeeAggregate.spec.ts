import { EmployeeAggregate } from '../../src/domain/aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../../src/domain/enums/EmployeeStatus';
import { Identifier } from '../../../../kernel/domain/Identifier';
import {
  EmployeeCreatedEvent,
  EmployeeStatusChangedEvent,
  EmployeeTerminatedEvent,
} from '../../src/domain/events/EmployeeEvents';
import { InvalidEmployeeStatusTransitionException } from '../../src/domain/exceptions/EmployeeExceptions';

describe('EmployeeAggregate', () => {
  const makeEmployee = (
    status: EmployeeStatus = EmployeeStatus.ONBOARDING,
  ): EmployeeAggregate => {
    return EmployeeAggregate.create(
      {
        businessId: 'EMP_000001',
        companyId: new Identifier<string>('company-1'),
        profileId: 'profile-1',
        status,
        joinedDate: new Date('2025-01-01'),
        departmentId: null,
        designationId: null,
        branchId: null,
        reportsToId: null,
        employeeNumber: null,
        confirmationDate: null,
        probationEndDate: null,
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

  describe('create', () => {
    it('should create with ONBOARDING status', () => {
      const employee = makeEmployee();
      expect(employee.status).toBe(EmployeeStatus.ONBOARDING);
      expect(employee.businessId).toBe('EMP_000001');
    });

    it('should emit EmployeeCreatedEvent', () => {
      const employee = makeEmployee();
      expect(employee.domainEvents[0]).toBeInstanceOf(EmployeeCreatedEvent);
    });
  });

  describe('activate', () => {
    it('should transition ONBOARDING → ACTIVE', () => {
      const employee = makeEmployee(EmployeeStatus.ONBOARDING);
      employee.activate('user-1');
      expect(employee.status).toBe(EmployeeStatus.ACTIVE);
      expect(employee.confirmationDate).toBeDefined();
    });

    it('should throw on invalid transition TERMINATED → ACTIVE', () => {
      const employee = makeEmployee(EmployeeStatus.TERMINATED);
      expect(() => employee.activate('user-1')).toThrow(
        InvalidEmployeeStatusTransitionException,
      );
    });
  });

  describe('terminate', () => {
    it('should terminate ACTIVE employee and emit events', () => {
      const employee = makeEmployee(EmployeeStatus.ACTIVE);
      const terminationDate = new Date();
      employee.clearEvents();
      employee.terminate(terminationDate, 'Contract ended', 'user-1');
      expect(employee.status).toBe(EmployeeStatus.TERMINATED);
      expect(employee.terminationDate).toEqual(terminationDate);
      const terminatedEvent = employee.domainEvents.find(
        (e: any) => e instanceof EmployeeTerminatedEvent,
      ) as EmployeeTerminatedEvent;
      expect(terminatedEvent).toBeDefined();
      expect(terminatedEvent.reason).toBe('Contract ended');
    });
  });

  describe('update', () => {
    it('should update department and increment version', () => {
      const employee = makeEmployee(EmployeeStatus.ACTIVE);
      const initialVersion = employee.version;
      employee.update('dept-1', null, null, null, null, 'user-1');
      expect(employee.departmentId).toBe('dept-1');
      expect(employee.version).toBe(initialVersion + 1);
    });
  });

  describe('softDelete', () => {
    it('should mark as deleted', () => {
      const employee = makeEmployee();
      employee.softDelete('user-1');
      expect(employee.isDeleted).toBe(true);
    });
  });
});
