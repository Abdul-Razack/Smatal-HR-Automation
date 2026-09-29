import { ExecutionContext, ForbiddenException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtStrategy } from './infrastructure/auth/JwtStrategy';
import { RolesGuard } from './presentation/guards/RolesGuard';
import { ROLES_KEY, PERMISSIONS_KEY } from './presentation/guards/roles.decorator';
import { GlobalExceptionFilter } from '../../../bootstrap/filters/GlobalExceptionFilter';
import { DomainException } from '../../../kernel/domain/DomainException';
import { AnalyticsController } from '../../analytics/src/presentation/controllers/AnalyticsController';
import { AuditController } from '../../audit/src/presentation/controllers/AuditController';
import { NotificationController } from '../../notification/src/presentation/controllers/NotificationController';
import { GeneratedDocumentController } from '../../document/src/presentation/controllers/GeneratedDocumentController';
import { DocumentDownloadController } from '../../document/src/presentation/controllers/DocumentDownloadController';
import { TemplateController } from '../../document/src/presentation/controllers/TemplateController';
import { RoleController } from './presentation/controllers/RoleController';
import { Result } from '../../../kernel/result/Result';

describe('STEP 2: Security, Authentication, Authorization & Tenant Isolation', () => {
  // =========================================================================
  // 1. JWT STRATEGY TESTS (Tests A, B, C)
  // =========================================================================
  describe('JWT Strategy & Token Validation', () => {
    let jwtStrategy: JwtStrategy;
    const mockConfigService: any = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    beforeEach(() => {
      jwtStrategy = new JwtStrategy(mockConfigService);
    });

    it('Test A & B: should reject token payload missing sub (user ID)', async () => {
      const invalidPayload = { companyId: 'cmp-123' };
      await expect(jwtStrategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Test A & B: should reject token payload missing companyId (tenant)', async () => {
      const invalidPayload = { sub: 'usr-123' };
      await expect(jwtStrategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should successfully extract identity, tenant, roles, and permissions from valid payload', async () => {
      const validPayload = {
        sub: 'usr-123',
        email: 'admin@smatal.com',
        companyId: 'cmp-tenant-1',
        profileId: 'prf-123',
        roles: ['SUPER_ADMIN'],
        permissions: ['*'],
      };

      const user = await jwtStrategy.validate(validPayload);
      expect(user).toEqual({
        id: 'usr-123',
        userId: 'usr-123',
        email: 'admin@smatal.com',
        companyId: 'cmp-tenant-1',
        profileId: 'prf-123',
        roles: ['SUPER_ADMIN'],
        permissions: ['*'],
      });
    });
  });

  // =========================================================================
  // 2. ROLES & PERMISSIONS GUARD TESTS (Test F)
  // =========================================================================
  describe('RolesGuard Authorization & RBAC', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      rolesGuard = new RolesGuard(reflector);
    });

    const createMockContext = (user: any): ExecutionContext => {
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user }),
        }),
      } as any;
    };

    it('should allow access when no roles or permissions are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({ userId: 'usr-1', roles: ['EMPLOYEE'] });
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['COMPANY_ADMIN'];
        return undefined;
      });
      const context = createMockContext(null);
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN access regardless of required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['COMPANY_ADMIN'];
        return undefined;
      });
      const context = createMockContext({
        userId: 'usr-admin',
        roles: ['SUPER_ADMIN'],
        permissions: ['*'],
      });
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should deny access if user lacks required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === ROLES_KEY) return ['COMPANY_ADMIN'];
        return undefined;
      });
      const context = createMockContext({
        userId: 'usr-emp',
        roles: ['EMPLOYEE'],
        permissions: ['employee:read'],
      });
      expect(() => rolesGuard.canActivate(context)).toThrow(
        'You do not have the required role to access this resource.',
      );
    });

    it('should allow access if user has required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return ['employee:read'];
        return undefined;
      });
      const context = createMockContext({
        userId: 'usr-emp',
        roles: ['EMPLOYEE'],
        permissions: ['employee:read'],
      });
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should deny access if user lacks required permission', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
        if (key === PERMISSIONS_KEY) return ['employee:write'];
        return undefined;
      });
      const context = createMockContext({
        userId: 'usr-emp',
        roles: ['EMPLOYEE'],
        permissions: ['employee:read'],
      });
      expect(() => rolesGuard.canActivate(context)).toThrow(
        'You do not have the required permissions to access this resource.',
      );
    });
  });

  // =========================================================================
  // 3. MULTI-TENANT ISOLATION & HEADER SPOOFING PROTECTION (Tests D, E, G, H, I, J)
  // =========================================================================
  describe('Tenant Isolation & Anti-Spoofing in Controllers', () => {
    let mockQueryBus: any;
    let mockCommandBus: any;

    beforeEach(() => {
      mockQueryBus = { execute: jest.fn() };
      mockCommandBus = { execute: jest.fn() };
    });

    it('Test E & H: AnalyticsController strictly uses req.user.companyId for Dashboard', async () => {
      const controller = new AnalyticsController(mockQueryBus);
      mockQueryBus.execute.mockResolvedValue(Result.ok({ kpis: {} }));

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-1' },
        headers: { 'x-company-id': 'tenant-victim-B' }, // Spoof attempt
      };

      await controller.getDashboard(req, 'HR');

      const dispatchedQuery = mockQueryBus.execute.mock.calls[0][0];
      // Must query legit tenant A, completely ignoring spoofed tenant B
      expect(dispatchedQuery.companyId).toBe('tenant-legit-A');
      expect(dispatchedQuery.companyId).not.toBe('tenant-victim-B');
    });

    it('Test E & G: AnalyticsController strictly uses req.user.companyId for Global Search', async () => {
      const controller = new AnalyticsController(mockQueryBus);
      mockQueryBus.execute.mockResolvedValue(Result.ok([]));

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-1' },
        headers: { 'x-company-id': 'tenant-victim-B' }, // Spoof attempt
      };

      await controller.globalSearch(req, 'John', 10);

      const dispatchedQuery = mockQueryBus.execute.mock.calls[0][0];
      expect(dispatchedQuery.companyId).toBe('tenant-legit-A');
      expect(dispatchedQuery.companyId).not.toBe('tenant-victim-B');
    });

    it('Test E: AuditController strictly uses req.user.companyId and req.user.userId', async () => {
      const controller = new AuditController(mockCommandBus, mockQueryBus);
      mockCommandBus.execute.mockResolvedValue(Result.ok('audit-1'));

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-legit-1' },
        headers: {
          'x-company-id': 'tenant-victim-B',
          'x-user-id': 'usr-victim-2',
        },
      };

      await controller.createAuditLog(req, {
        entityType: 'EMPLOYEE',
        entityBusinessId: 'EMP-001',
        action: 'CREATED',
      });

      const dispatchedCommand = mockCommandBus.execute.mock.calls[0][0];
      expect(dispatchedCommand.companyId).toBe('tenant-legit-A');
      expect(dispatchedCommand.performedBy).toBe('usr-legit-1');
    });

    it('Test E: NotificationController strictly uses req.user.companyId and req.user.userId', async () => {
      const controller = new NotificationController(mockCommandBus, mockQueryBus);
      mockQueryBus.execute.mockResolvedValue(Result.ok([]));

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-legit-1' },
      };

      await controller.getNotifications(req);

      const dispatchedQuery = mockQueryBus.execute.mock.calls[0][0];
      expect(dispatchedQuery.companyId).toBe('tenant-legit-A');
      expect(dispatchedQuery.recipient).toBe('usr-legit-1');
    });

    it('Test E & J: GeneratedDocumentController strictly uses req.user.companyId for listing and generation', async () => {
      const controller = new GeneratedDocumentController(mockCommandBus, mockQueryBus);
      mockQueryBus.execute.mockResolvedValue(Result.ok([]));
      mockCommandBus.execute.mockResolvedValue(Result.ok('doc-1'));

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-legit-1' },
        headers: { 'x-company-id': 'tenant-victim-B' },
      };

      await controller.getAllDocuments(req, {} as any);
      expect(mockQueryBus.execute.mock.calls[0][0].companyId).toBe('tenant-legit-A');

      await controller.generateDocument(req, {
        documentTypeId: 'dct-1',
        entityType: 'EMPLOYEE',
        entityId: 'emp-1',
      } as any);

      const generateCommand = mockCommandBus.execute.mock.calls[0][0];
      expect(generateCommand.companyId).toBe('tenant-legit-A');
      expect(generateCommand.performedBy).toBe('usr-legit-1');
    });

    it('Test E & J: DocumentDownloadController isolates download and preview by req.user.companyId', async () => {
      const controller = new DocumentDownloadController(mockQueryBus);
      mockQueryBus.execute.mockResolvedValue(
        Result.ok({
          businessId: 'DOC-001',
          snapshots: [{ mimeType: 'application/pdf' }],
        }),
      );

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-1' },
        headers: { 'x-company-id': 'tenant-victim-B' },
      };

      const mockRes: any = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.downloadDocument(req, 'doc-123', 'pdf', mockRes);
      expect(mockQueryBus.execute.mock.calls[0][0].companyId).toBe('tenant-legit-A');
    });

    it('Test E & I: TemplateController isolates templates by req.user.companyId', async () => {
      const controller = new TemplateController(mockCommandBus, mockQueryBus);
      mockQueryBus.execute.mockResolvedValue(Result.ok([]));
      mockCommandBus.execute.mockResolvedValue(Result.ok('tmpl-1'));

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-legit-1' },
        headers: { 'x-company-id': 'tenant-victim-B' },
      };

      await controller.getTemplates(req, {} as any);
      expect(mockQueryBus.execute.mock.calls[0][0].companyId).toBe('tenant-legit-A');

      await controller.createTemplate(req, {
        documentTypeId: 'dct-1',
        name: 'Offer Letter',
        description: 'Template desc',
      } as any);

      const createCommand = mockCommandBus.execute.mock.calls[0][0];
      expect(createCommand.companyId).toBe('tenant-legit-A');
      expect(createCommand.performedBy).toBe('usr-legit-1');
    });

    it('Test E: RoleController overrides client-supplied companyId with req.user.companyId', async () => {
      const controller = new RoleController(mockQueryBus, mockCommandBus);
      mockCommandBus.execute.mockResolvedValue(undefined);

      const req = {
        user: { companyId: 'tenant-legit-A', userId: 'usr-legit-1' },
      };

      // Attacker passes companyId of Victim B in body
      await controller.createRole(req, {
        name: 'Malicious Role',
        code: 'HACK',
        companyId: 'tenant-victim-B',
      } as any);

      const createCommand = mockCommandBus.execute.mock.calls[0][0];
      // Must be forced to legitimate tenant A
      expect(createCommand.companyId).toBe('tenant-legit-A');
      expect(createCommand.companyId).not.toBe('tenant-victim-B');
    });
  });

  // =========================================================================
  // 4. GLOBAL EXCEPTION FILTER & NOT_FOUND DOMAIN ERRORS (Test D)
  // =========================================================================
  describe('GlobalExceptionFilter Domain Error Mapping', () => {
    let filter: GlobalExceptionFilter;
    let mockResponse: any;
    let mockArgumentsHost: any;

    beforeEach(() => {
      const mockLogger: any = {
        setContext: jest.fn(),
        error: jest.fn(),
      };
      filter = new GlobalExceptionFilter(mockLogger);

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      mockArgumentsHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => ({ headers: {}, url: '/test' }),
        }),
      };
    });

    it('Test D: maps DomainException with NOT_FOUND code to HTTP 404 (IDOR / Not Found)', () => {
      const notFoundException = new DomainException('Employee not found', 'NOT_FOUND');
      filter.catch(notFoundException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'NOT_FOUND',
          message: 'Employee not found',
        }),
      );
    });

    it('maps general DomainException to HTTP 400 Bad Request', () => {
      const domainRuleException = new DomainException(
        'Invalid status transition',
        'DOMAIN_RULE_VIOLATION',
      );
      filter.catch(domainRuleException, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'DOMAIN_RULE_VIOLATION',
        }),
      );
    });
  });
});
