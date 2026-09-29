import { EmployeeAggregate } from '../../src/domain/aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../../src/domain/enums/EmployeeStatus';
import { ResignationStatus, ClearanceDepartment, ClearanceStatus } from '../../src/domain/enums/ResignationEnums';
import { Identifier } from '../../../../kernel/domain/Identifier';
import { SubmitResignationHandler } from '../../src/application/commands/SubmitResignation/SubmitResignationHandler';
import { SubmitResignationCommand } from '../../src/application/commands/SubmitResignation/SubmitResignationCommand';
import { AcceptResignationHandler } from '../../src/application/commands/AcceptResignation/AcceptResignationHandler';
import { AcceptResignationCommand } from '../../src/application/commands/AcceptResignation/AcceptResignationCommand';
import { WithdrawResignationHandler } from '../../src/application/commands/WithdrawResignation/WithdrawResignationHandler';
import { WithdrawResignationCommand } from '../../src/application/commands/WithdrawResignation/WithdrawResignationCommand';
import { InitiateClearanceHandler } from '../../src/application/commands/InitiateClearance/InitiateClearanceHandler';
import { InitiateClearanceCommand } from '../../src/application/commands/InitiateClearance/InitiateClearanceCommand';
import { UpdateClearanceHandler } from '../../src/application/commands/UpdateClearance/UpdateClearanceHandler';
import { UpdateClearanceCommand } from '../../src/application/commands/UpdateClearance/UpdateClearanceCommand';
import { CompleteExitHandler } from '../../src/application/commands/CompleteExit/CompleteExitHandler';
import { CompleteExitCommand } from '../../src/application/commands/CompleteExit/CompleteExitCommand';
import { GetResignationHandler } from '../../src/application/queries/GetResignation/GetResignationHandler';
import { GetResignationQuery } from '../../src/application/queries/GetResignation/GetResignationQuery';
import { GetClearanceListHandler } from '../../src/application/queries/GetClearanceList/GetClearanceListHandler';
import { GetClearanceListQuery } from '../../src/application/queries/GetClearanceList/GetClearanceListQuery';
import { GetExitOverviewHandler } from '../../src/application/queries/GetExitOverview/GetExitOverviewHandler';
import { GetExitOverviewQuery } from '../../src/application/queries/GetExitOverview/GetExitOverviewQuery';
import { EmployeeDomainService } from '../../src/domain/services/EmployeeDomainService';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { EmployeeController } from '../../src/presentation/controllers/EmployeeController';

describe('Step 8 — Resignation, NOC & Exit Management Specification', () => {
  const companyA = 'comp-aaa-111';
  const companyB = 'comp-bbb-222';
  const hrUserId = 'user-hr-1';

  const makeEmployee = (
    options?: {
      id?: string;
      status?: EmployeeStatus;
      companyId?: string;
      resignationStatus?: ResignationStatus;
      resignationDate?: Date;
      lastWorkingDate?: Date;
      noticePeriodDays?: number;
    },
  ): EmployeeAggregate => {
    const empId = options?.id ?? 'emp-100';
    return EmployeeAggregate.reconstitute(
      {
        businessId: 'EMP_000100',
        companyId: new Identifier<string>(options?.companyId ?? companyA),
        profileId: `profile-${empId}`,
        status: options?.status ?? EmployeeStatus.CONFIRMED,
        joinedDate: new Date('2024-01-01'),
        departmentId: 'dept-eng',
        designationId: 'desig-lead',
        branchId: 'branch-main',
        reportsToId: null,
        employeeNumber: 'EMP-100',
        employmentType: 'Full-time',
        salary: 120000,
        confirmationDate: new Date('2024-07-01'),
        probationEndDate: new Date('2024-06-30'),
        resignationDate: options?.resignationDate ?? null,
        lastWorkingDate: options?.lastWorkingDate ?? null,
        noticePeriodDays: options?.noticePeriodDays ?? 30,
        terminationDate: null,
        resignationReason: options?.resignationStatus ? 'Career change' : null,
        resignationStatus: options?.resignationStatus ?? ResignationStatus.NOT_SUBMITTED,
        isDeleted: false,
        version: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        createdBy: hrUserId,
        updatedBy: hrUserId,
      },
      new Identifier<string>(empId),
    );
  };

  describe('1. Domain Lifecycle & Resignation Invariants', () => {
    it('A. submits resignation and transitions resignationStatus to SUBMITTED', () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      const resDate = new Date('2026-10-01');

      emp.submitResignation(resDate, 'Relocating to another city', 'user-emp-1', 30);

      expect(emp.resignationStatus).toBe(ResignationStatus.SUBMITTED);
      expect(emp.resignationDate).toEqual(resDate);
      expect(emp.resignationReason).toBe('Relocating to another city');
      expect(emp.noticePeriodDays).toBe(30);
      expect(emp.lastWorkingDate).toBeDefined();
      expect(emp.lastWorkingDate!.getTime()).toBeGreaterThan(resDate.getTime());
    });

    it('B. rejects duplicate resignation when already SUBMITTED or ACCEPTED', () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      emp.submitResignation(new Date('2026-10-01'), 'First submission', 'user-emp-1');

      expect(() => {
        emp.submitResignation(new Date('2026-10-02'), 'Second submission', 'user-emp-1');
      }).toThrow(/An active resignation has already been submitted/);
    });

    it('rejects resignation if employee is in invalid lifecycle status (e.g. PROBATION or JOINED)', () => {
      const emp = makeEmployee({ status: EmployeeStatus.PROBATION });

      expect(() => {
        emp.submitResignation(new Date('2026-10-01'), 'Cannot submit in probation', 'user-emp-1');
      }).toThrow(/Only confirmed employees can submit resignation/);
    });

    it('C & D. accepts resignation: transitions CONFIRMED → NOTICE_PERIOD and records accepted info', () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      emp.submitResignation(new Date('2026-10-01'), 'Seeking new opportunities', 'user-emp-1', 30);

      const agreedLwd = new Date('2026-11-15');
      emp.acceptResignation(hrUserId, 'Approved by HR', agreedLwd);

      expect(emp.status).toBe(EmployeeStatus.NOTICE_PERIOD);
      expect(emp.resignationStatus).toBe(ResignationStatus.ACCEPTED);
      expect(emp.lastWorkingDate).toEqual(agreedLwd);
    });

    it('F. withdraws resignation: reverts NOTICE_PERIOD → CONFIRMED and status becomes WITHDRAWN', () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      emp.submitResignation(new Date('2026-10-01'), 'Resigning', 'user-emp-1', 30);
      emp.acceptResignation(hrUserId, 'Accepted');

      expect(emp.status).toBe(EmployeeStatus.NOTICE_PERIOD);
      expect(emp.resignationStatus).toBe(ResignationStatus.ACCEPTED);

      emp.withdrawResignation('user-emp-1', 'Decided to stay after retention bonus');

      expect(emp.status).toBe(EmployeeStatus.CONFIRMED);
      expect(emp.resignationStatus).toBe(ResignationStatus.WITHDRAWN);
    });

    it('E & L. completes exit: transitions NOTICE_PERIOD → RELIEVED and sets resignationStatus COMPLETED', () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      emp.submitResignation(new Date('2026-10-01'), 'Moving on', 'user-emp-1', 30);
      emp.acceptResignation(hrUserId, 'Accepted');

      const finalLwd = new Date('2026-10-31');
      emp.completeExit(hrUserId, 'All handovers complete', finalLwd);

      expect(emp.status).toBe(EmployeeStatus.RELIEVED);
      expect(emp.resignationStatus).toBe(ResignationStatus.COMPLETED);
      expect(emp.lastWorkingDate).toEqual(finalLwd);
    });

    it('rejects exit completion if resignation was not accepted', () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      emp.submitResignation(new Date('2026-10-01'), 'Resigning', 'user-emp-1');

      expect(() => {
        emp.completeExit(hrUserId, 'Skipped acceptance');
      }).toThrow(/Resignation must be accepted before completing exit/);
    });

    it('rejects withdrawal after employee has been relieved', () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      emp.submitResignation(new Date('2026-10-01'), 'Resigning', 'user-emp-1');
      emp.acceptResignation(hrUserId, 'Accepted');
      emp.completeExit(hrUserId, 'Completed');

      expect(() => {
        emp.withdrawResignation(hrUserId, 'Too late');
      }).toThrow(/Cannot withdraw resignation after employee has been relieved/);
    });
  });

  describe('2. CQRS Commands & Business Rule Validation', () => {
    let mockEmployeeRepo: any;
    let mockHistoryRepo: any;
    let mockUow: any;
    let domainService: EmployeeDomainService;
    let mockPrisma: any;

    beforeEach(() => {
      mockEmployeeRepo = {
        findById: jest.fn(),
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockHistoryRepo = {
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockUow = {
        withTransaction: jest.fn().mockImplementation(async (cb) => cb()),
      };
      domainService = new EmployeeDomainService();
      mockPrisma = {
        resignation: {
          create: jest.fn().mockResolvedValue({ id: 'res-1' }),
          findFirst: jest.fn(),
          update: jest.fn().mockResolvedValue({ id: 'res-1' }),
          findMany: jest.fn().mockResolvedValue([]),
        },
        exitClearance: {
          findMany: jest.fn().mockResolvedValue([]),
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'clr-1' }),
          upsert: jest.fn().mockResolvedValue({ id: 'clr-1' }),
        },
      };
    });

    it('A & S. SubmitResignationHandler saves employee, records EmploymentHistory and persists Resignation', async () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      const handler = new SubmitResignationHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        domainService,
        mockPrisma,
      );

      const result = await handler.execute(
        new SubmitResignationCommand(
          emp.id.toString(),
          companyA,
          'user-emp-1',
          'HR_MANAGER',
          new Date('2026-10-01'),
          'Career advancement',
          30,
        ),
      );

      expect(result.isSuccess).toBe(true);
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
      expect(mockHistoryRepo.save).toHaveBeenCalled();
      expect(mockPrisma.resignation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            employeeId: emp.id.toString(),
            status: ResignationStatus.SUBMITTED,
          }),
        }),
      );
    });

    it('O. blocks cross-tenant resignation submission (Company B cannot submit for Company A employee)', async () => {
      const emp = makeEmployee({ companyId: companyA, status: EmployeeStatus.CONFIRMED });
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      const handler = new SubmitResignationHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        domainService,
        mockPrisma,
      );

      const result = await handler.execute(
        new SubmitResignationCommand(
          emp.id.toString(),
          companyB, // Cross-tenant!
          'user-b',
          'HR_MANAGER',
          new Date('2026-10-01'),
          'Hack attempt',
        ),
      );

      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Employee not found');
    });

    it('Q. enforces employee IDOR protection: employee cannot submit resignation for another employee', async () => {
      const emp = makeEmployee({ id: 'emp-1', status: EmployeeStatus.CONFIRMED });
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      const handler = new SubmitResignationHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        domainService,
        mockPrisma,
      );

      await expect(
        handler.execute(
          new SubmitResignationCommand(
            emp.id.toString(),
            companyA,
            'other-emp-user-id', // IDOR attack
            'EMPLOYEE',
            new Date('2026-10-01'),
            'IDOR attempt',
          ),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('C & G. AcceptResignationHandler transitions to NOTICE_PERIOD and auto-initializes 4 clearance departments', async () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      emp.submitResignation(new Date('2026-10-01'), 'Moving abroad', 'user-emp-1');
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      mockPrisma.resignation.findFirst.mockResolvedValue({
        id: 'res-1',
        status: ResignationStatus.SUBMITTED,
      });

      const handler = new AcceptResignationHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        domainService,
        mockPrisma,
      );

      const result = await handler.execute(
        new AcceptResignationCommand(
          emp.id.toString(),
          companyA,
          hrUserId,
          'Approved with standard notice',
          new Date('2026-10-31'),
        ),
      );

      expect(result.isSuccess).toBe(true);
      expect(emp.status).toBe(EmployeeStatus.NOTICE_PERIOD);
      expect(emp.resignationStatus).toBe(ResignationStatus.ACCEPTED);

      // Verify all 4 clearance departments are created
      expect(mockPrisma.exitClearance.create).toHaveBeenCalledTimes(4);
    });

    it('H. UpdateClearanceHandler updates departmental clearance status and records clearedBy', async () => {
      const emp = makeEmployee({ status: EmployeeStatus.NOTICE_PERIOD });
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      const handler = new UpdateClearanceHandler(
        mockEmployeeRepo,
        domainService,
        mockPrisma,
      );

      const result = await handler.execute(
        new UpdateClearanceCommand(
          emp.id.toString(),
          companyA,
          hrUserId,
          ClearanceDepartment.IT,
          ClearanceStatus.CLEARED,
          'Returned MacBook Pro and access badge',
        ),
      );

      expect(result.isSuccess).toBe(true);
      expect(mockPrisma.exitClearance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            department: ClearanceDepartment.IT,
            status: ClearanceStatus.CLEARED,
          }),
        }),
      );
    });

    it('I & J. CompleteExitHandler rejects exit if any clearance department is still PENDING', async () => {
      const emp = makeEmployee({
        status: EmployeeStatus.NOTICE_PERIOD,
        resignationStatus: ResignationStatus.ACCEPTED,
        lastWorkingDate: new Date('2026-10-31'),
      });
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      // Only HR and FINANCE cleared; IT and ADMINISTRATION pending
      mockPrisma.exitClearance.findMany.mockResolvedValue([
        { department: ClearanceDepartment.HR, status: ClearanceStatus.CLEARED },
        { department: ClearanceDepartment.FINANCE, status: ClearanceStatus.CLEARED },
        { department: ClearanceDepartment.IT, status: ClearanceStatus.PENDING },
        { department: ClearanceDepartment.ADMINISTRATION, status: ClearanceStatus.PENDING },
      ]);

      const handler = new CompleteExitHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        domainService,
        mockPrisma,
      );

      const result = await handler.execute(
        new CompleteExitCommand(emp.id.toString(), companyA, hrUserId),
      );

      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Required departmental clearance is pending for: IT, ADMINISTRATION');
      expect(emp.status).toBe(EmployeeStatus.NOTICE_PERIOD); // Not relieved!
    });

    it('J & L. CompleteExitHandler succeeds when all clearances are CLEARED or NOT_APPLICABLE and relieves employee', async () => {
      const emp = makeEmployee({
        status: EmployeeStatus.NOTICE_PERIOD,
        resignationStatus: ResignationStatus.ACCEPTED,
        lastWorkingDate: new Date('2026-10-31'),
      });
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      // All 4 departments cleared / not applicable
      mockPrisma.exitClearance.findMany.mockResolvedValue([
        { department: ClearanceDepartment.HR, status: ClearanceStatus.CLEARED },
        { department: ClearanceDepartment.FINANCE, status: ClearanceStatus.CLEARED },
        { department: ClearanceDepartment.IT, status: ClearanceStatus.CLEARED },
        { department: ClearanceDepartment.ADMINISTRATION, status: ClearanceStatus.NOT_APPLICABLE },
      ]);

      mockPrisma.resignation.findFirst.mockResolvedValue({
        id: 'res-100',
        status: ResignationStatus.ACCEPTED,
      });

      const handler = new CompleteExitHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        domainService,
        mockPrisma,
      );

      const result = await handler.execute(
        new CompleteExitCommand(emp.id.toString(), companyA, hrUserId, new Date('2026-10-31'), 'Handover verified'),
      );

      expect(result.isSuccess).toBe(true);
      expect(emp.status).toBe(EmployeeStatus.RELIEVED);
      expect(emp.resignationStatus).toBe(ResignationStatus.COMPLETED);
      expect(mockHistoryRepo.save).toHaveBeenCalled();
      expect(mockEmployeeRepo.save).toHaveBeenCalled();
    });

    it('T. UnitOfWork transaction rolls back changes if database error occurs', async () => {
      const emp = makeEmployee({ status: EmployeeStatus.CONFIRMED });
      mockEmployeeRepo.findById.mockResolvedValue(emp);
      mockEmployeeRepo.save.mockRejectedValue(new Error('DB Connection Timeout'));

      const handler = new SubmitResignationHandler(
        mockEmployeeRepo,
        mockHistoryRepo,
        mockUow,
        domainService,
        mockPrisma,
      );

      const result = await handler.execute(
        new SubmitResignationCommand(
          emp.id.toString(),
          companyA,
          'user-1',
          'HR_MANAGER',
          new Date('2026-10-01'),
          'Resigning',
        ),
      );

      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('DB Connection Timeout');
    });
  });

  describe('3. Queries & Overview Workspace', () => {
    let mockEmployeeRepo: any;
    let domainService: EmployeeDomainService;
    let mockPrisma: any;

    beforeEach(() => {
      mockEmployeeRepo = { findById: jest.fn() };
      domainService = new EmployeeDomainService();
      mockPrisma = {
        resignation: { findMany: jest.fn() },
        exitClearance: { findMany: jest.fn() },
        employee: { findMany: jest.fn() },
      };
    });

    it('GetResignationHandler returns latest status and historical records', async () => {
      const emp = makeEmployee({
        resignationStatus: ResignationStatus.ACCEPTED,
        resignationDate: new Date('2026-10-01'),
        lastWorkingDate: new Date('2026-10-31'),
        noticePeriodDays: 30,
      });
      mockEmployeeRepo.findById.mockResolvedValue(emp);

      mockPrisma.resignation.findMany.mockResolvedValue([
        {
          id: 'res-1',
          resignationDate: new Date('2026-10-01'),
          lastWorkingDate: new Date('2026-10-31'),
          noticePeriodDays: 30,
          reason: 'Relocating',
          status: ResignationStatus.ACCEPTED,
          acceptedBy: hrUserId,
          acceptedAt: new Date('2026-10-02'),
          comments: 'Approved',
          createdAt: new Date('2026-10-01'),
        },
      ]);

      const handler = new GetResignationHandler(mockEmployeeRepo, domainService, mockPrisma);
      const res = await handler.execute(new GetResignationQuery(emp.id.toString(), companyA));

      expect(res.status).toBe(ResignationStatus.ACCEPTED);
      expect(res.history).toHaveLength(1);
      expect(res.history[0].reason).toBe('Relocating');
    });

    it('GetClearanceListHandler returns all 4 departments even if not yet saved in DB', async () => {
      const emp = makeEmployee({ status: EmployeeStatus.NOTICE_PERIOD });
      mockEmployeeRepo.findById.mockResolvedValue(emp);
      mockPrisma.exitClearance.findMany.mockResolvedValue([
        { department: ClearanceDepartment.IT, status: ClearanceStatus.CLEARED, remarks: 'Laptop returned' },
      ]);

      const handler = new GetClearanceListHandler(mockEmployeeRepo, domainService, mockPrisma);
      const res = await handler.execute(new GetClearanceListQuery(emp.id.toString(), companyA));

      expect(res.clearances).toHaveLength(4);
      expect(res.isAllCleared).toBe(false);

      const itDept = res.clearances.find((c) => c.department === ClearanceDepartment.IT);
      expect(itDept?.status).toBe(ClearanceStatus.CLEARED);

      const hrDept = res.clearances.find((c) => c.department === ClearanceDepartment.HR);
      expect(hrDept?.status).toBe(ClearanceStatus.PENDING);
    });

    it('GetExitOverviewHandler aggregates company exit metrics and pipeline items', async () => {
      mockPrisma.employee.findMany.mockResolvedValue([
        {
          id: 'emp-1',
          businessId: 'EMP_0001',
          profile: { firstName: 'Alice', lastName: 'Smith' },
          department: { name: 'Engineering' },
          designation: { name: 'Senior Dev' },
          status: EmployeeStatus.NOTICE_PERIOD,
          resignationStatus: ResignationStatus.ACCEPTED,
          resignationDate: new Date('2026-10-01'),
          lastWorkingDate: new Date('2026-10-31'),
          noticePeriodDays: 30,
          clearances: [
            { department: ClearanceDepartment.HR, status: ClearanceStatus.CLEARED },
            { department: ClearanceDepartment.FINANCE, status: ClearanceStatus.CLEARED },
            { department: ClearanceDepartment.IT, status: ClearanceStatus.CLEARED },
            { department: ClearanceDepartment.ADMINISTRATION, status: ClearanceStatus.CLEARED },
          ],
        },
        {
          id: 'emp-2',
          businessId: 'EMP_0002',
          profile: { firstName: 'Bob', lastName: 'Jones' },
          department: { name: 'Sales' },
          designation: { name: 'Account Exec' },
          status: EmployeeStatus.CONFIRMED,
          resignationStatus: ResignationStatus.SUBMITTED,
          resignationDate: new Date('2026-10-05'),
          lastWorkingDate: new Date('2026-11-05'),
          noticePeriodDays: 30,
          clearances: [],
        },
      ]);

      const handler = new GetExitOverviewHandler(mockPrisma);
      const res = await handler.execute(new GetExitOverviewQuery(companyA));

      expect(res.pendingResignationsCount).toBe(1);
      expect(res.activeNoticePeriodsCount).toBe(1);
      expect(res.pipeline).toHaveLength(2);
      expect(res.pipeline[0].clearanceProgress.isAllCleared).toBe(true);
      expect(res.pipeline[1].clearanceProgress.isAllCleared).toBe(false);
    });
  });

  describe('4. EmployeeController Endpoints & RBAC Protection', () => {
    let controller: EmployeeController;
    let commandBus: any;
    let queryBus: any;

    beforeEach(() => {
      commandBus = { execute: jest.fn().mockResolvedValue({ isSuccess: true, getValue: () => undefined }) };
      queryBus = { execute: jest.fn() };
      controller = new EmployeeController(commandBus, queryBus);
    });

    it('allows HR Manager to submit resignation for employee', async () => {
      const req = { user: { companyId: companyA, userId: hrUserId, role: 'HR_MANAGER' } };
      const dto = {
        resignationDate: '2026-10-01',
        reason: 'Relocating',
        noticePeriodDays: 30,
      };

      const res = await controller.submitResignation(req, 'emp-123', dto);
      expect(res.success).toBe(true);
      expect(commandBus.execute).toHaveBeenCalled();
    });

    it('R. blocks Employee from viewing another employee resignation (IDOR check)', async () => {
      const req = {
        user: { companyId: companyA, userId: 'user-emp-1', role: 'EMPLOYEE', employeeId: 'emp-1' },
      };

      await expect(controller.getResignation(req, 'emp-999')).rejects.toThrow(ForbiddenException);
    });

    it('blocks Employee from viewing another employee clearance (IDOR check)', async () => {
      const req = {
        user: { companyId: companyA, userId: 'user-emp-1', role: 'EMPLOYEE', employeeId: 'emp-1' },
      };

      await expect(controller.getClearance(req, 'emp-999')).rejects.toThrow(ForbiddenException);
    });

    it('triggers exit completion and returns confirmation message', async () => {
      const req = { user: { companyId: companyA, userId: hrUserId, role: 'HR_MANAGER' } };
      const dto = { notes: 'All handovers signed' };

      const res = await controller.completeExit(req, 'emp-123', dto);
      expect(res.success).toBe(true);
      expect(res.message).toContain('RELIEVED');
    });
  });
});
