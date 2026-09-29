import { GetDashboardHandler } from '../../src/application/queries/GetDashboard/GetDashboardHandler';
import { GetDashboardQuery } from '../../src/application/queries/GetDashboard/GetDashboardQuery';
import { DashboardController } from '../../src/presentation/controllers/DashboardController';
import { AnalyticsController } from '../../src/presentation/controllers/AnalyticsController';

describe('Step 10 — Simple HR Dashboard Specification', () => {
  const companyA = '11111111-1111-1111-1111-111111111111';
  const companyB = '22222222-2222-2222-2222-222222222222';

  let mockPrisma: any;
  let handler: GetDashboardHandler;
  let dashboardController: DashboardController;
  let analyticsController: AnalyticsController;
  let mockQueryBus: any;

  beforeEach(() => {
    mockPrisma = {
      employee: {
        count: jest.fn(),
        groupBy: jest.fn(),
        findMany: jest.fn(),
      },
      resignation: {
        count: jest.fn(),
      },
      workflowInstance: {
        count: jest.fn(),
      },
      generatedDocument: {
        count: jest.fn(),
      },
      department: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    handler = new GetDashboardHandler(mockPrisma);

    mockQueryBus = {
      execute: jest.fn(),
    };
    dashboardController = new DashboardController(mockQueryBus);
    analyticsController = new AnalyticsController(mockQueryBus);
  });

  describe('1. Dashboard Metrics & Lifecycle Aggregations (D, E, F, G, H, I)', () => {
    it('D-I. accurately computes total, active, probation, confirmed, notice, and relieved employee counts from real records', async () => {
      // Mock employee total count
      mockPrisma.employee.count.mockResolvedValue(10);

      // Mock groupBy status: 1 OFFER, 2 JOINED, 2 PROBATION, 3 CONFIRMED, 1 NOTICE_PERIOD, 1 RELIEVED
      mockPrisma.employee.groupBy.mockResolvedValue([
        { status: 'OFFER', _count: { id: 1 } },
        { status: 'JOINED', _count: { id: 2 } },
        { status: 'PROBATION', _count: { id: 2 } },
        { status: 'CONFIRMED', _count: { id: 3 } },
        { status: 'NOTICE_PERIOD', _count: { id: 1 } },
        { status: 'RELIEVED', _count: { id: 1 } },
      ]);

      mockPrisma.resignation.count.mockResolvedValue(2);
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(5);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      const result = await handler.execute(new GetDashboardQuery(companyA, 'HR'));

      expect(result.isSuccess).toBe(true);
      const data = result.getValue();

      // D. Total Employees
      expect(data.totalEmployees).toBe(10);
      // E. Active Employees (JOINED(2) + PROBATION(2) + CONFIRMED(3) + NOTICE_PERIOD(1) = 8)
      expect(data.activeEmployees).toBe(8);
      // F. Probation
      expect(data.probationEmployees).toBe(2);
      // G. Confirmed
      expect(data.confirmedEmployees).toBe(3);
      // H. Notice Period
      expect(data.noticePeriodEmployees).toBe(1);
      // I. Relieved
      expect(data.relievedEmployees).toBe(1);

      // Lifecycle breakdown object
      expect(data.lifecycleBreakdown).toEqual({
        OFFER: 1,
        JOINED: 2,
        PROBATION: 2,
        CONFIRMED: 3,
        NOTICE_PERIOD: 1,
        RELIEVED: 1,
      });
    });
  });

  describe('2. Lists & Exit Summary (J, K, L, M)', () => {
    it('J. returns new joiners this month with department and designation', async () => {
      const thisMonthDate = new Date();
      mockPrisma.employee.count.mockResolvedValue(1);
      mockPrisma.employee.groupBy.mockResolvedValue([{ status: 'JOINED', _count: { id: 1 } }]);
      mockPrisma.resignation.count.mockResolvedValue(0);
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(0);

      mockPrisma.employee.findMany
        .mockResolvedValueOnce([
          {
            id: 'emp-1',
            businessId: 'EMP-001',
            joinedDate: thisMonthDate,
            profile: { firstName: 'Alice', lastName: 'Smith' },
            department: { name: 'Engineering' },
            designation: { name: 'Software Engineer' },
          },
        ]) // newJoiners
        .mockResolvedValueOnce([]) // upcomingConfirmations
        .mockResolvedValueOnce([]) // noticePeriod
        .mockResolvedValueOnce([]); // recentRelieved

      const result = await handler.execute(new GetDashboardQuery(companyA, 'HR'));
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();

      expect(data.newJoinersThisMonth).toHaveLength(1);
      expect(data.newJoinersThisMonth[0]).toEqual({
        id: 'emp-1',
        employeeId: 'EMP-001',
        name: 'Alice Smith',
        department: 'Engineering',
        designation: 'Software Engineer',
        joiningDate: thisMonthDate,
      });
    });

    it('K. returns upcoming confirmations within 30 days', async () => {
      const confirmationDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      mockPrisma.employee.count.mockResolvedValue(1);
      mockPrisma.employee.groupBy.mockResolvedValue([{ status: 'PROBATION', _count: { id: 1 } }]);
      mockPrisma.resignation.count.mockResolvedValue(0);
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(0);

      mockPrisma.employee.findMany
        .mockResolvedValueOnce([]) // newJoiners
        .mockResolvedValueOnce([
          {
            id: 'emp-2',
            businessId: 'EMP-002',
            confirmationDate,
            profile: { firstName: 'Bob', lastName: 'Taylor' },
            department: { name: 'Marketing' },
            designation: { name: 'SEO Lead' },
          },
        ]) // upcomingConfirmations
        .mockResolvedValueOnce([]) // noticePeriod
        .mockResolvedValueOnce([]); // recentRelieved

      const result = await handler.execute(new GetDashboardQuery(companyA, 'HR'));
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();

      expect(data.upcomingConfirmations).toHaveLength(1);
      expect(data.upcomingConfirmations[0].name).toBe('Bob Taylor');
      expect(data.upcomingConfirmations[0].designation).toBe('SEO Lead');
      expect(data.upcomingConfirmations[0].confirmationDate).toEqual(confirmationDate);
    });

    it('L & M. returns pending resignations count and recently relieved employees', async () => {
      const lastWorkingDate = new Date();
      mockPrisma.employee.count.mockResolvedValue(2);
      mockPrisma.employee.groupBy.mockResolvedValue([
        { status: 'NOTICE_PERIOD', _count: { id: 1 } },
        { status: 'RELIEVED', _count: { id: 1 } },
      ]);
      mockPrisma.resignation.count.mockResolvedValue(3); // 3 pending resignations
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(0);

      mockPrisma.employee.findMany
        .mockResolvedValueOnce([]) // newJoiners
        .mockResolvedValueOnce([]) // upcomingConfirmations
        .mockResolvedValueOnce([
          {
            id: 'emp-3',
            businessId: 'EMP-003',
            lastWorkingDate,
            profile: { firstName: 'Charlie', lastName: 'Brown' },
            department: { name: 'Operations' },
            designation: { name: 'Ops Manager' },
          },
        ]) // noticePeriod
        .mockResolvedValueOnce([
          {
            id: 'emp-4',
            businessId: 'EMP-004',
            lastWorkingDate,
            updatedAt: lastWorkingDate,
            profile: { firstName: 'David', lastName: 'Miller' },
            department: { name: 'Finance' },
            designation: { name: 'Accountant' },
          },
        ]); // recentRelieved

      const result = await handler.execute(new GetDashboardQuery(companyA, 'HR'));
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();

      // L. Pending resignations
      expect(data.pendingResignations).toBe(3);
      // Notice period list
      expect(data.noticePeriodList).toHaveLength(1);
      expect(data.noticePeriodList[0].name).toBe('Charlie Brown');
      // M. Recent relieved
      expect(data.recentRelieved).toHaveLength(1);
      expect(data.recentRelieved[0].name).toBe('David Miller');
    });
  });

  describe('3. Empty States & Robustness (N)', () => {
    it('N. handles empty states correctly when no employees or exits exist', async () => {
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.employee.groupBy.mockResolvedValue([]);
      mockPrisma.resignation.count.mockResolvedValue(0);
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(0);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      const result = await handler.execute(new GetDashboardQuery(companyA, 'HR'));
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();

      expect(data.totalEmployees).toBe(0);
      expect(data.activeEmployees).toBe(0);
      expect(data.probationEmployees).toBe(0);
      expect(data.confirmedEmployees).toBe(0);
      expect(data.noticePeriodEmployees).toBe(0);
      expect(data.relievedEmployees).toBe(0);
      expect(data.newJoinersThisMonth).toEqual([]);
      expect(data.upcomingConfirmations).toEqual([]);
      expect(data.noticePeriodList).toEqual([]);
      expect(data.pendingResignations).toBe(0);
      expect(data.recentRelieved).toEqual([]);
    });
  });

  describe('4. Tenant Isolation & Security (A, B, C, O, P)', () => {
    it('B & O. strictly enforces tenant isolation in queries: cannot see cross-tenant data', async () => {
      mockPrisma.employee.count.mockResolvedValue(5);
      mockPrisma.employee.groupBy.mockResolvedValue([]);
      mockPrisma.resignation.count.mockResolvedValue(0);
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(0);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      await handler.execute(new GetDashboardQuery(companyA, 'HR'));

      // Verify that every single query sent to Prisma contains { companyId: companyA }
      expect(mockPrisma.employee.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: companyA, isDeleted: false }),
        }),
      );
      expect(mockPrisma.employee.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: companyA, isDeleted: false }),
        }),
      );
      expect(mockPrisma.resignation.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: companyA, isDeleted: false }),
        }),
      );
    });

    it('P. verifies client-supplied companyId cannot override JWT companyId in DashboardController', async () => {
      mockQueryBus.execute.mockResolvedValue({
        isFailure: false,
        getValue: () => ({ totalEmployees: 5 }),
      });

      const req = {
        user: { companyId: companyA, userId: 'user-1' },
        body: { companyId: companyB },
        query: { companyId: companyB },
      };

      await dashboardController.getSummary(req);

      // Verify query was dispatched strictly with companyA from req.user
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: companyA,
          dashboardType: 'HR',
        }),
      );
    });

    it('P. verifies client-supplied companyId cannot override JWT companyId in AnalyticsController', async () => {
      mockQueryBus.execute.mockResolvedValue({
        isFailure: false,
        getValue: () => ({ totalEmployees: 5 }),
      });

      const req = {
        user: { companyId: companyA, userId: 'user-1' },
        body: { companyId: companyB },
        query: { companyId: companyB, type: 'HR' },
      };

      await analyticsController.getSummary(req);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: companyA,
          dashboardType: 'HR',
        }),
      );
    });
  });
});
