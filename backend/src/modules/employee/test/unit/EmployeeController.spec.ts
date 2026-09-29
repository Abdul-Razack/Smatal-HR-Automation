import { EmployeeController } from '../../src/presentation/controllers/EmployeeController';
import { CreateEmployeeRequest, UpdateEmployeeRequest } from '../../src/application/dto/requests/EmployeeRequests';
import { Result } from '../../../../kernel/result/Result';
import { EmployeeResponseDto } from '../../src/application/dto/responses/EmployeeResponseDto';
import { EmployeeStatus } from '../../src/domain/enums/EmployeeStatus';
import { RolesGuard } from '../../../identity/src/presentation/guards/RolesGuard';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../identity/src/presentation/guards/roles.decorator';
import { ForbiddenException } from '@nestjs/common';

describe('EmployeeController & Security', () => {
  let controller: EmployeeController;
  let mockCommandBus: any;
  let mockQueryBus: any;

  beforeEach(() => {
    mockCommandBus = {
      execute: jest.fn(),
    };
    mockQueryBus = {
      execute: jest.fn(),
    };
    controller = new EmployeeController(mockCommandBus, mockQueryBus);
  });

  describe('Identity & Tenant context', () => {
    it('should use authenticated user companyId and userId from JWT (no spoofing)', async () => {
      const mockReq = {
        user: {
          userId: 'user-jwt-123',
          companyId: 'company-jwt-456',
        },
      };

      const dto: CreateEmployeeRequest = {
        firstName: 'John',
        lastName: 'Doe',
        personalEmail: 'john@example.com',
        joinedDate: '2025-01-01',
      };

      const mockResponseDto = new EmployeeResponseDto();
      mockResponseDto.id = 'emp-1';
      mockResponseDto.businessId = 'EMP_000001';
      mockCommandBus.execute.mockResolvedValue(Result.ok(mockResponseDto));

      await controller.create(mockReq, dto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'company-jwt-456',
          performedBy: 'user-jwt-123',
          firstName: 'John',
          lastName: 'Doe',
          personalEmail: 'john@example.com',
        }),
      );
    });

    it('should pass search parameter to ListEmployeesQuery', async () => {
      const mockReq = {
        user: { companyId: 'company-jwt-456' },
      };

      mockQueryBus.execute.mockResolvedValue({ data: [], total: 0 });

      await controller.list(mockReq, EmployeeStatus.ACTIVE, 'dept-1', 'john', 1, 10);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 'company-jwt-456',
          status: EmployeeStatus.ACTIVE,
          departmentId: 'dept-1',
          search: 'john',
          page: 1,
          limit: 10,
        }),
      );
    });
  });

  describe('RBAC RolesGuard on Employee endpoints', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      rolesGuard = new RolesGuard(reflector);
    });

    const createMockContext = (handler: any, user: any) => ({
      getHandler: () => handler,
      getClass: () => EmployeeController,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any);

    it('should allow COMPANY_ADMIN to create an employee', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
        return undefined;
      });

      const context = createMockContext(controller.create, {
        roles: ['COMPANY_ADMIN'],
        permissions: [],
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should deny regular EMPLOYEE from creating an employee', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
        return undefined;
      });

      const context = createMockContext(controller.create, {
        roles: ['EMPLOYEE'],
        permissions: [],
      });

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow HR_MANAGER to update an employee', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
        return undefined;
      });

      const context = createMockContext(controller.update, {
        roles: ['HR_MANAGER'],
        permissions: [],
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should deny regular EMPLOYEE from updating an employee', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
        return undefined;
      });

      const context = createMockContext(controller.update, {
        roles: ['EMPLOYEE'],
        permissions: [],
      });

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow HR_MANAGER to perform lifecycle transition', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
        return undefined;
      });

      const context = createMockContext(controller.transitionLifecycle, {
        roles: ['HR_MANAGER'],
        permissions: [],
      });

      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should deny regular EMPLOYEE from performing lifecycle transition', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
        return undefined;
      });

      const context = createMockContext(controller.transitionLifecycle, {
        roles: ['EMPLOYEE'],
        permissions: [],
      });

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('Lifecycle Transition execution', () => {
    it('should dispatch TransitionLifecycleCommand with JWT companyId and userId', async () => {
      const mockReq = {
        user: {
          userId: 'hr-user-id',
          companyId: 'company-uuid',
        },
      };

      mockCommandBus.execute.mockResolvedValue(Result.ok());

      const res = await controller.transitionLifecycle(mockReq, 'emp-uuid-1', {
        status: EmployeeStatus.CONFIRMED,
        confirmationDate: '2025-04-01',
        notes: 'Confirmed employee',
      });

      expect(res).toEqual({ success: true, status: EmployeeStatus.CONFIRMED });
      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          employeeId: 'emp-uuid-1',
          companyId: 'company-uuid',
          performedBy: 'hr-user-id',
          targetStatus: EmployeeStatus.CONFIRMED,
          notes: 'Confirmed employee',
        }),
      );
    });
  });
});
