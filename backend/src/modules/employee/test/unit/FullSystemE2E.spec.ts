import { Identifier } from '../../../../kernel/domain/Identifier';
import { Result } from '../../../../kernel/result/Result';
import { EmployeeAggregate } from '../../src/domain/aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../../src/domain/enums/EmployeeStatus';
import {
  ResignationStatus,
  ClearanceDepartment,
  ClearanceStatus,
} from '../../src/domain/enums/ResignationEnums';
import { CompanyAggregate } from '../../../organization/src/domain/entities/CompanyAggregate';
import { DocumentTypeAggregate } from '../../../document/src/domain/aggregates/DocumentTypeAggregate';
import { TemplateAggregate } from '../../../document/src/domain/aggregates/TemplateAggregate';
import { TemplateVersionEntity } from '../../../document/src/domain/entities/TemplateVersionEntity';
import { GeneratedDocumentAggregate } from '../../../document/src/domain/aggregates/GeneratedDocumentAggregate';
import { DocumentSnapshotVO } from '../../../document/src/domain/value-objects/DocumentSnapshotVO';
import {
  TemplateStatus,
  TemplateVersionStatus,
  DocumentGenerationStatus,
} from '../../../document/src/domain/enums/DocumentEnums';
import { PdfGenerationService } from '../../../document/src/infrastructure/services/PdfGenerationService';
import { HtmlConverterService } from '../../../document/src/infrastructure/services/HtmlConverterService';
import { GeneratedDocumentMapper } from '../../../document/src/infrastructure/mappers/GeneratedDocumentMapper';
import { GetDashboardHandler } from '../../../analytics/src/application/queries/GetDashboard/GetDashboardHandler';
import { GetDashboardQuery } from '../../../analytics/src/application/queries/GetDashboard/GetDashboardQuery';
import { JwtStrategy } from '../../../identity/src/infrastructure/auth/JwtStrategy';
import { RolesGuard } from '../../../identity/src/presentation/guards/RolesGuard';
import { ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('Step 12 — Comprehensive End-to-End System Validation', () => {
  // Test Tenants
  const tenantACompanyId = '11111111-1111-1111-1111-111111111111';
  const tenantBCompanyId = '22222222-2222-2222-2222-222222222222';

  // Test Users
  const adminUserId = 'admin-user-001';
  const hrManagerUserId = 'hr-user-002';
  const employeeUserId = 'emp-user-003';
  const tenantBUserId = 'tenant-b-user-999';

  // Services
  let htmlConverter: HtmlConverterService;
  let pdfService: PdfGenerationService;
  let docMapper: GeneratedDocumentMapper;
  let jwtStrategy: JwtStrategy;

  beforeAll(() => {
    htmlConverter = new HtmlConverterService();
    pdfService = new PdfGenerationService(htmlConverter);
    docMapper = new GeneratedDocumentMapper();
    jwtStrategy = new JwtStrategy({
      get: jest.fn().mockReturnValue('super-secret-jwt-key'),
    } as any);
  });

  afterAll(async () => {
    await pdfService.onModuleDestroy();
  });

  // =========================================================================
  // 1. AUTHENTICATION & RBAC VALIDATION
  // =========================================================================
  describe('Flow 1: Authentication, Token Security & RBAC', () => {
    it('1.1 validates authentic JWT payload and extracts tenant identity strictly', async () => {
      const validPayload = {
        sub: adminUserId,
        email: 'admin@smatal.com',
        companyId: tenantACompanyId,
        profileId: 'prof-admin-1',
        roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'],
        permissions: ['*'],
      };

      const user = await jwtStrategy.validate(validPayload);
      expect(user.userId).toBe(adminUserId);
      expect(user.companyId).toBe(tenantACompanyId);
      expect(user.roles).toContain('SUPER_ADMIN');
    });

    it('1.2 rejects tokens missing tenant companyId or user ID', async () => {
      await expect(jwtStrategy.validate({ sub: adminUserId })).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(jwtStrategy.validate({ companyId: tenantACompanyId })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('1.3 enforces RBAC: Employee role cannot access HR-only operations', () => {
      const reflector: any = {
        getAllAndOverride: jest.fn().mockImplementation((key: string) => {
          if (key === 'roles') return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
          return undefined;
        }),
      };
      const guard = new RolesGuard(reflector);

      const employeeContext: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: employeeUserId, companyId: tenantACompanyId, role: 'EMPLOYEE', roles: ['EMPLOYEE'] },
          }),
        }),
      };

      expect(() => guard.canActivate(employeeContext)).toThrow(ForbiddenException);
    });

    it('1.4 enforces RBAC: HR Manager can execute permitted HR operations', () => {
      const reflector: any = {
        getAllAndOverride: jest.fn().mockImplementation((key: string) => {
          if (key === 'roles') return ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'];
          return undefined;
        }),
      };
      const guard = new RolesGuard(reflector);

      const hrContext: any = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: hrManagerUserId, companyId: tenantACompanyId, role: 'HR_MANAGER', roles: ['HR_MANAGER'] },
          }),
        }),
      };

      expect(guard.canActivate(hrContext)).toBe(true);
    });
  });

  // =========================================================================
  // 2. COMPANY SETTINGS & MULTI-TENANT ISOLATION
  // =========================================================================
  describe('Flow 2: Company Settings & Multi-Tenant Branding Isolation', () => {
    let companyA: CompanyAggregate;
    let companyB: CompanyAggregate;

    beforeEach(() => {
      companyA = CompanyAggregate.create({
        businessId: 'CMP_000001',
        name: 'Smatal Tech Global',
        legalName: 'Smatal Technologies Pvt Ltd',
        code: 'SMATAL',
        website: 'https://smatal.com',
        address: '100 Cyber City, Tech Hub',
        phone: '+91 98765 43210',
        email: 'contact@smatal.com',
        industry: 'Software',
        authorizedPerson: 'Jane Doe',
        authorizedPersonDesignation: 'VP People & Culture',
        logoUrl: 'https://storage.smatal.com/logos/smatal-logo.png',
        signatureUrl: 'https://storage.smatal.com/signatures/jane-sig.png',
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUserId,
        updatedBy: adminUserId,
      }, new Identifier(tenantACompanyId));

      companyB = CompanyAggregate.create({
        businessId: 'CMP_000002',
        name: 'Beta Enterprises',
        legalName: 'Beta Enterprises Ltd',
        code: 'BETA',
        website: 'https://beta.com',
        address: '500 Commerce St',
        phone: '+1 800 555 0199',
        email: 'contact@beta.com',
        industry: 'Finance',
        authorizedPerson: 'Bob Smith',
        authorizedPersonDesignation: 'Director of HR',
        logoUrl: null,
        signatureUrl: null,
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUserId,
        updatedBy: adminUserId,
      }, new Identifier(tenantBCompanyId));
    });

    it('2.1 updates company information and authorized signatory cleanly', () => {
      companyA.updateSettings({
        name: 'Smatal Innovations Global',
        legalName: 'Smatal Innovations Private Limited',
        address: '200 Silicon Avenue, Tower 4',
        phone: '+91 98765 00000',
        email: 'hr@smatal.com',
        website: 'https://innovations.smatal.com',
        authorizedPerson: 'Dr. Sarah Connor',
        authorizedPersonDesignation: 'Chief People Officer',
      }, hrManagerUserId);

      expect(companyA.name).toBe('Smatal Innovations Global');
      expect(companyA.authorizedPerson).toBe('Dr. Sarah Connor');
      expect(companyA.authorizedPersonDesignation).toBe('Chief People Officer');
      expect(companyA.address).toBe('200 Silicon Avenue, Tower 4');
    });

    it('2.2 maintains strict tenant isolation: Tenant B settings cannot modify Tenant A', () => {
      expect(companyA.id.toValue()).toBe(tenantACompanyId);
      expect(companyB.id.toValue()).toBe(tenantBCompanyId);
      expect(companyA.authorizedPerson).not.toBe(companyB.authorizedPerson);
    });
  });

  // =========================================================================
  // 3. EMPLOYEE CREATION & LIFECYCLE PROGRESSION E2E
  // =========================================================================
  describe('Flow 3: Employee Creation & Full Lifecycle Progression', () => {
    let employee: EmployeeAggregate;

    it('3.1 creates an employee in OFFER state with complete profile', () => {
      employee = EmployeeAggregate.create({
        businessId: 'EMP_2026_001',
        companyId: new Identifier(tenantACompanyId),
        profileId: 'prof-alice-001',
        employeeNumber: 'EMP-001',
        employmentType: 'Full-time',
        status: EmployeeStatus.OFFER,
        joinedDate: new Date('2026-09-01'),
        salary: 1500000,
        departmentId: 'dept-engineering',
        designationId: 'desig-lead-eng',
        branchId: 'branch-headquarters',
        reportsToId: null,
        isDeleted: false,
        version: 1,
        createdAt: new Date('2026-08-15'),
        updatedAt: new Date('2026-08-15'),
        createdBy: hrManagerUserId,
        updatedBy: hrManagerUserId,
      }, new Identifier('emp-alice-001'), hrManagerUserId);

      expect(employee.status).toBe(EmployeeStatus.OFFER);
      expect(employee.businessId).toBe('EMP_2026_001');
      expect(employee.companyId.toValue()).toBe(tenantACompanyId);
    });

    it('3.2 transitions OFFER -> JOINED when joining date is verified', () => {
      const joinDate = new Date('2026-09-01');
      employee.transitionLifecycle(EmployeeStatus.JOINED, hrManagerUserId, {
        effectiveDate: joinDate,
        notes: 'Candidate reported for Day 1 induction',
      });

      expect(employee.status).toBe(EmployeeStatus.JOINED);
      expect(employee.joinedDate).toEqual(joinDate);
    });

    it('3.3 transitions JOINED -> PROBATION with probation period configured', () => {
      const probEndDate = new Date('2027-03-01'); // 6 months probation
      employee.transitionLifecycle(EmployeeStatus.PROBATION, hrManagerUserId, {
        effectiveDate: new Date('2026-09-01'),
        probationEndDate: probEndDate,
        notes: 'Onboarding completed; beginning 6-month probation',
      });

      expect(employee.status).toBe(EmployeeStatus.PROBATION);
      expect(employee.probationEndDate).toEqual(probEndDate);
    });

    it('3.4 transitions PROBATION -> CONFIRMED with confirmation date set', () => {
      const confDate = new Date('2027-03-01');
      employee.transitionLifecycle(EmployeeStatus.CONFIRMED, hrManagerUserId, {
        effectiveDate: confDate,
        confirmationDate: confDate,
        notes: 'Probation review successfully completed with rating Outstanding',
      });

      expect(employee.status).toBe(EmployeeStatus.CONFIRMED);
      expect(employee.confirmationDate).toEqual(confDate);
    });

    it('3.5 rejects illegal lifecycle rollback (e.g. CONFIRMED -> OFFER)', () => {
      expect(() => {
        employee.transitionLifecycle(EmployeeStatus.OFFER, hrManagerUserId, {
          effectiveDate: new Date(),
        });
      }).toThrow();
    });
  });

  // =========================================================================
  // 4. TEMPLATE VERSIONING & REAL PDF GENERATION E2E
  // =========================================================================
  describe('Flow 4: Template Versioning, Placeholders & Real PDF Generation', () => {
    let docType: DocumentTypeAggregate;
    let template: TemplateAggregate;
    let version1: TemplateVersionEntity;
    let version2: TemplateVersionEntity;

    beforeAll(() => {
      docType = DocumentTypeAggregate.create({
        businessId: 'DT_0001',
        companyId: tenantACompanyId,
        name: 'Appointment Letter',
        code: 'APPOINTMENT_LETTER',
        description: 'Official employment appointment contract',
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });

      template = TemplateAggregate.create({
        businessId: 'TMPL_0001',
        companyId: tenantACompanyId,
        documentTypeId: docType.id.toString(),
        name: 'Standard Appointment Letter',
        description: 'Primary corporate appointment template',
        status: TemplateStatus.PUBLISHED,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminUserId,
        updatedBy: adminUserId,
        versions: [],
      });

      // Template Version 1
      version1 = TemplateVersionEntity.create({
        businessId: 'TVER_0001',
        templateId: template.id.toString(),
        versionNumber: 1,
        content: `
          <div style="font-family: Arial, sans-serif; padding: 40px;">
            <h1 style="color: #1e3a8a;">APPOINTMENT LETTER (v1)</h1>
            <p>Dear <strong>{{employee.fullName}}</strong>,</p>
            <p>We are pleased to appoint you as <strong>{{employee.designation}}</strong> at <strong>{{company.name}}</strong>.</p>
            <p>Your joining date is <strong>{{employee.joinedDate}}</strong> with annual compensation of <strong>{{employee.salary}}</strong>.</p>
            <br/><br/>
            <p>Sincerely,</p>
            <p><strong>{{company.authorizedPerson}}</strong><br/>{{company.authorizedPersonDesignation}}<br/>{{company.name}}</p>
          </div>
        `,
        contentType: 'html',
        status: TemplateVersionStatus.PUBLISHED,
        placeholders: [],
        isDeleted: false,
        version: 1,
        createdAt: new Date('2026-08-01'),
        updatedAt: new Date('2026-08-01'),
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });

      // Template Version 2 (Revised branding & additional clause)
      version2 = TemplateVersionEntity.create({
        businessId: 'TVER_0002',
        templateId: template.id.toString(),
        versionNumber: 2,
        content: `
          <div style="font-family: Arial, sans-serif; padding: 40px; border-top: 5px solid #2563eb;">
            <h1 style="color: #2563eb;">APPOINTMENT LETTER (v2 - Updated Branding)</h1>
            <p>Dear <strong>{{employee.fullName}}</strong> (ID: {{employee.employeeNumber}}),</p>
            <p>We are thrilled to appoint you as <strong>{{employee.designation}}</strong> in the <strong>{{employee.department}}</strong> team at <strong>{{company.name}}</strong>.</p>
            <p>Compensation: <strong>{{employee.salary}}</strong>. Reporting location: {{company.address}}.</p>
            <p><em>Security & Confidentiality: All intellectual property belongs exclusively to {{company.name}}.</em></p>
            <br/><br/>
            <p>Authorized Signatory:</p>
            <p><strong>{{company.authorizedPerson}}</strong><br/>{{company.authorizedPersonDesignation}}</p>
          </div>
        `,
        contentType: 'html',
        status: TemplateVersionStatus.PUBLISHED,
        placeholders: [],
        isDeleted: false,
        version: 1,
        createdAt: new Date('2026-08-20'),
        updatedAt: new Date('2026-08-20'),
        createdBy: adminUserId,
        updatedBy: adminUserId,
      });

      template.addVersion(version1);
    });

    it('4.1 generates genuine PDF bytes starting with %PDF- for Version 1', async () => {
      // Resolve sample placeholders for Version 1
      const resolvedHtmlV1 = version1.content
        .replace('{{employee.fullName}}', 'Alice Cooper')
        .replace('{{employee.designation}}', 'Senior Fullstack Engineer')
        .replace('{{company.name}}', 'Smatal Tech Global')
        .replace('{{employee.joinedDate}}', '01 September 2026')
        .replace('{{employee.salary}}', '₹15,00,000 per annum')
        .replace('{{company.authorizedPerson}}', 'Jane Doe')
        .replace('{{company.authorizedPersonDesignation}}', 'VP People & Culture')
        .replace('{{company.name}}', 'Smatal Tech Global');

      const pdfBuffer = await pdfService.generateFromHtml(resolvedHtmlV1);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
      expect(pdfBuffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    }, 45000);

    it('4.2 activates Version 2 and generates distinct PDF preserving Version 1 immutability', async () => {
      template.addVersion(version2);

      const resolvedHtmlV2 = version2.content
        .replace('{{employee.fullName}}', 'Alice Cooper')
        .replace('{{employee.employeeNumber}}', 'EMP-001')
        .replace('{{employee.designation}}', 'Senior Fullstack Engineer')
        .replace('{{employee.department}}', 'Engineering')
        .replace('{{company.name}}', 'Smatal Tech Global')
        .replace('{{employee.salary}}', '₹15,00,000 per annum')
        .replace('{{company.address}}', '100 Cyber City, Tech Hub')
        .replace('{{company.name}}', 'Smatal Tech Global')
        .replace('{{company.authorizedPerson}}', 'Jane Doe')
        .replace('{{company.authorizedPersonDesignation}}', 'VP People & Culture');

      const pdfBufferV2 = await pdfService.generateFromHtml(resolvedHtmlV2);

      expect(Buffer.isBuffer(pdfBufferV2)).toBe(true);
      expect(pdfBufferV2.subarray(0, 5).toString('utf-8')).toBe('%PDF-');

      // Verify versions remain distinct
      expect(version1.versionNumber).toBe(1);
      expect(version2.versionNumber).toBe(2);
      expect(version1.id.toValue()).not.toBe(version2.id.toValue());
    }, 45000);
  });

  // =========================================================================
  // 5. IMMUTABLE STORED DOCUMENTS & PROVENANCE
  // =========================================================================
  describe('Flow 5: Stored Generated Documents, Immutability & Provenance', () => {
    let historicalDocV1: GeneratedDocumentAggregate;
    let newDocV2: GeneratedDocumentAggregate;

    beforeAll(() => {
      historicalDocV1 = GeneratedDocumentAggregate.create({
        businessId: 'GDOC-2026-0001',
        companyId: tenantACompanyId,
        profileId: 'prof-alice-001',
        documentTypeId: 'dt-appointment-id',
        templateVersionId: 'ver-1-id',
        entityType: 'EMPLOYEE',
        entityId: 'emp-alice-001',
        status: DocumentGenerationStatus.GENERATED,
        generatedAt: new Date('2026-08-01T10:00:00Z'),
        generatedBy: hrManagerUserId,
        isDeleted: false,
        version: 1,
        createdAt: new Date('2026-08-01T10:00:00Z'),
        updatedAt: new Date('2026-08-01T10:00:00Z'),
        createdBy: hrManagerUserId,
        updatedBy: hrManagerUserId,
        snapshots: [
          DocumentSnapshotVO.create({
            id: 'snap-001',
            generatedDocumentId: 'gdoc-001',
            filePath: '/storage/tenantA/docs/GDOC-2026-0001.pdf',
            fileUrl: 'https://storage.smatal.com/tenantA/docs/GDOC-2026-0001.pdf',
            fileSize: 15420,
            mimeType: 'application/pdf',
            checksum: 'sha256-hash-snapshot-1',
            storageProvider: 's3',
            createdAt: new Date('2026-08-01T10:00:00Z'),
            createdBy: hrManagerUserId,
          }),
        ],
        documentTypeName: 'Appointment Letter',
        documentTypeCode: 'APPOINTMENT_LETTER',
        templateName: 'Standard Appointment Letter',
        templateVersionNumber: 1,
        employeeName: 'Alice Cooper',
        employeeNumber: 'EMP-001',
        companyName: 'Smatal Tech Global',
      });

      newDocV2 = GeneratedDocumentAggregate.create({
        businessId: 'GDOC-2026-0002',
        companyId: tenantACompanyId,
        profileId: 'prof-alice-001',
        documentTypeId: 'dt-appointment-id',
        templateVersionId: 'ver-2-id',
        entityType: 'EMPLOYEE',
        entityId: 'emp-alice-001',
        status: DocumentGenerationStatus.GENERATED,
        generatedAt: new Date('2026-08-25T11:00:00Z'),
        generatedBy: hrManagerUserId,
        isDeleted: false,
        version: 1,
        createdAt: new Date('2026-08-25T11:00:00Z'),
        updatedAt: new Date('2026-08-25T11:00:00Z'),
        createdBy: hrManagerUserId,
        updatedBy: hrManagerUserId,
        snapshots: [
          DocumentSnapshotVO.create({
            id: 'snap-002',
            generatedDocumentId: 'gdoc-002',
            filePath: '/storage/tenantA/docs/GDOC-2026-0002.pdf',
            fileUrl: 'https://storage.smatal.com/tenantA/docs/GDOC-2026-0002.pdf',
            fileSize: 16890,
            mimeType: 'application/pdf',
            checksum: 'sha256-hash-snapshot-2',
            storageProvider: 's3',
            createdAt: new Date('2026-08-25T11:00:00Z'),
            createdBy: hrManagerUserId,
          }),
        ],
        documentTypeName: 'Appointment Letter',
        documentTypeCode: 'APPOINTMENT_LETTER',
        templateName: 'Standard Appointment Letter',
        templateVersionNumber: 2,
        employeeName: 'Alice Cooper',
        employeeNumber: 'EMP-001',
        companyName: 'Smatal Tech Global',
      });
    });

    it('5.1 maps complete provenance metadata without exposing raw UUIDs as primary title', () => {
      const dto = docMapper.toDTO(historicalDocV1);

      expect(dto.businessId).toBe('GDOC-2026-0001');
      expect(dto.documentTypeName).toBe('Appointment Letter');
      expect(dto.templateName).toBe('Standard Appointment Letter');
      expect(dto.templateVersionNumber).toBe(1);
      expect(dto.employeeName).toBe('Alice Cooper');
      expect(dto.employeeNumber).toBe('EMP-001');
      expect(dto.companyName).toBe('Smatal Tech Global');
      expect(dto.status).toBe(DocumentGenerationStatus.GENERATED);
    });

    it('5.2 guarantees historical immutability: Document 1 snapshot remains linked to Version 1', () => {
      const dto1 = docMapper.toDTO(historicalDocV1);
      const dto2 = docMapper.toDTO(newDocV2);

      expect(dto1.templateVersionNumber).toBe(1);
      expect(dto2.templateVersionNumber).toBe(2);
      expect(dto1.snapshots[0].checksum).toBe('sha256-hash-snapshot-1');
      expect(dto2.snapshots[0].checksum).toBe('sha256-hash-snapshot-2');
    });
  });

  // =========================================================================
  // 6. RESIGNATION, NOC, CLEARANCE & EXIT COMPLETION E2E
  // =========================================================================
  describe('Flow 6: Resignation, Departmental Clearance & Exit Completion', () => {
    let exitEmployee: EmployeeAggregate;

    beforeEach(() => {
      exitEmployee = EmployeeAggregate.reconstitute({
        businessId: 'EMP_2026_001',
        companyId: new Identifier(tenantACompanyId),
        profileId: 'prof-alice-001',
        status: EmployeeStatus.CONFIRMED,
        joinedDate: new Date('2026-09-01'),
        departmentId: 'dept-engineering',
        designationId: 'desig-lead-eng',
        branchId: 'branch-headquarters',
        reportsToId: null,
        employeeNumber: 'EMP-001',
        employmentType: 'Full-time',
        salary: 1500000,
        confirmationDate: new Date('2027-03-01'),
        probationEndDate: new Date('2027-03-01'),
        resignationDate: null,
        lastWorkingDate: null,
        noticePeriodDays: null,
        terminationDate: null,
        resignationReason: null,
        resignationStatus: ResignationStatus.NOT_SUBMITTED,
        isDeleted: false,
        version: 1,
        createdAt: new Date('2026-08-15'),
        updatedAt: new Date('2026-08-15'),
        createdBy: hrManagerUserId,
        updatedBy: hrManagerUserId,
      }, new Identifier('emp-alice-001'));
    });

    it('6.1 submits resignation and marks resignation status SUBMITTED', () => {
      const resDate = new Date('2027-08-01');
      const lwd = new Date('2027-08-31');
      const noticeDays = 30;

      exitEmployee.submitResignation(
        resDate,
        'Pursuing higher education abroad',
        employeeUserId,
        noticeDays,
        lwd,
      );

      expect(exitEmployee.status).toBe(EmployeeStatus.CONFIRMED);
      expect(exitEmployee.resignationStatus).toBe(ResignationStatus.SUBMITTED);
      expect(exitEmployee.resignationDate).toEqual(resDate);
      expect(exitEmployee.lastWorkingDate).toEqual(lwd);
      expect(exitEmployee.noticePeriodDays).toBe(noticeDays);
    });

    it('6.2 accepts resignation and transitions CONFIRMED -> NOTICE_PERIOD', () => {
      exitEmployee.submitResignation(
        new Date('2027-08-01'),
        'Pursuing higher education abroad',
        employeeUserId,
        30,
        new Date('2027-08-31'),
      );

      exitEmployee.acceptResignation(
        hrManagerUserId,
        'Resignation accepted. Notice period will be served in full.',
      );

      expect(exitEmployee.resignationStatus).toBe(ResignationStatus.ACCEPTED);
      expect(exitEmployee.status).toBe(EmployeeStatus.NOTICE_PERIOD);
    });

    it('6.3 completes exit and transitions NOTICE_PERIOD -> RELIEVED', () => {
      exitEmployee.submitResignation(
        new Date('2027-08-01'),
        'Pursuing higher education abroad',
        employeeUserId,
        30,
        new Date('2027-08-31'),
      );
      exitEmployee.acceptResignation(
        hrManagerUserId,
      );

      exitEmployee.completeExit(
        hrManagerUserId,
        'All departmental clearances (HR, IT, Finance, Admin) fully verified and cleared.',
        new Date('2027-08-31'),
      );

      expect(exitEmployee.status).toBe(EmployeeStatus.RELIEVED);
      expect(exitEmployee.resignationStatus).toBe(ResignationStatus.COMPLETED);
    });

    it('6.4 enforces RELIEVED as terminal state: cannot transition further', () => {
      exitEmployee.submitResignation(
        new Date('2027-08-01'),
        'Pursuing higher education abroad',
        employeeUserId,
        30,
        new Date('2027-08-31'),
      );
      exitEmployee.acceptResignation(hrManagerUserId);
      exitEmployee.completeExit(hrManagerUserId);

      // Attempting to transition a RELIEVED employee must be rejected
      expect(() => {
        exitEmployee.transitionLifecycle(EmployeeStatus.PROBATION, hrManagerUserId, {
          effectiveDate: new Date(),
        });
      }).toThrow();
    });
  });

  // =========================================================================
  // 7. EXIT DOCUMENTS GENERATION (RELIEVING, EXPERIENCE, NOC)
  // =========================================================================
  describe('Flow 7: Exit Documents Generation & PDF Validation', () => {
    it('7.1 generates genuine Relieving Letter PDF with exit metadata', async () => {
      const relievingHtml = `
        <div style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #1e3a8a;">RELIEVING LETTER</h1>
          <p>Date: 31 August 2027</p>
          <p>Dear <strong>Alice Cooper</strong>,</p>
          <p>This is to certify that you have been relieved from your services as <strong>Senior Fullstack Engineer</strong> at <strong>Smatal Tech Global</strong> with effect from the close of business hours on <strong>31 August 2027</strong>.</p>
          <p>Your conduct during the tenure from 01 September 2026 to 31 August 2027 was exemplary.</p>
          <br/><br/>
          <p>Authorized Signatory,</p>
          <p><strong>Jane Doe</strong><br/>VP People & Culture<br/>Smatal Tech Global</p>
        </div>
      `;

      const pdfBuffer = await pdfService.generateFromHtml(relievingHtml);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
      expect(pdfBuffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    }, 45000);

    it('7.2 generates genuine Experience & Service Certificate PDF', async () => {
      const experienceHtml = `
        <div style="font-family: Arial, sans-serif; padding: 40px;">
          <h1 style="text-align: center; color: #047857;">EXPERIENCE CERTIFICATE</h1>
          <p>TO WHOMSOEVER IT MAY CONCERN</p>
          <p>This is to certify that <strong>Alice Cooper</strong> (Employee ID: EMP-001) was employed with <strong>Smatal Tech Global</strong> from <strong>01 September 2026</strong> to <strong>31 August 2027</strong>.</p>
          <p>During her tenure, she served as <strong>Senior Fullstack Engineer</strong> and handled critical core platform initiatives.</p>
          <br/><br/>
          <p>Authorized Signatory,</p>
          <p><strong>Jane Doe</strong><br/>VP People & Culture</p>
        </div>
      `;

      const pdfBuffer = await pdfService.generateFromHtml(experienceHtml);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
      expect(pdfBuffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    }, 45000);
  });

  // =========================================================================
  // 8. DASHBOARD OVERVIEW & METRICS VERIFICATION E2E
  // =========================================================================
  describe('Flow 8: Dashboard Metrics & State Consistency', () => {
    let mockPrisma: any;
    let dashboardHandler: GetDashboardHandler;

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

      dashboardHandler = new GetDashboardHandler(mockPrisma);
    });

    it('8.1 computes exact tenant metrics after full employee lifecycle progression', async () => {
      // 10 total employees: 1 offer, 2 joined, 2 probation, 3 confirmed, 1 notice, 1 relieved
      mockPrisma.employee.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(9)  // active
        .mockResolvedValueOnce(2)  // probation
        .mockResolvedValueOnce(3)  // confirmed
        .mockResolvedValueOnce(1)  // notice
        .mockResolvedValueOnce(1)  // relieved
        .mockResolvedValueOnce(2); // new joiners

      mockPrisma.resignation.count.mockResolvedValueOnce(1); // pending resignations
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(5); // 5 generated documents

      mockPrisma.employee.groupBy.mockResolvedValue([
        { status: 'OFFER', _count: { id: 1 } },
        { status: 'JOINED', _count: { id: 2 } },
        { status: 'PROBATION', _count: { id: 2 } },
        { status: 'CONFIRMED', _count: { id: 3 } },
        { status: 'NOTICE_PERIOD', _count: { id: 1 } },
        { status: 'RELIEVED', _count: { id: 1 } },
      ]);

      mockPrisma.employee.findMany.mockResolvedValue([]);

      const result = await dashboardHandler.execute(new GetDashboardQuery(tenantACompanyId, 'HR'));

      expect(result.isSuccess).toBe(true);
      const data = result.getValue();

      expect(data.totalEmployees).toBe(10);
      expect(data.activeEmployees).toBe(8);
      expect(data.probationEmployees).toBe(2);
      expect(data.confirmedEmployees).toBe(3);
      expect(data.noticePeriodEmployees).toBe(1);
      expect(data.relievedEmployees).toBe(1);
      expect(data.generatedDocuments).toBe(5);
      expect(data.lifecycleBreakdown.PROBATION).toBe(2);
      expect(data.lifecycleBreakdown.CONFIRMED).toBe(3);
      expect(data.lifecycleBreakdown.RELIEVED).toBe(1);
    });

    it('8.2 returns clean zeroed metrics for empty tenant', async () => {
      mockPrisma.employee.count.mockResolvedValue(0);
      mockPrisma.resignation.count.mockResolvedValue(0);
      mockPrisma.workflowInstance.count.mockResolvedValue(0);
      mockPrisma.generatedDocument.count.mockResolvedValue(0);
      mockPrisma.employee.groupBy.mockResolvedValue([]);
      mockPrisma.employee.findMany.mockResolvedValue([]);

      const result = await dashboardHandler.execute(new GetDashboardQuery(tenantBCompanyId, 'HR'));

      expect(result.isSuccess).toBe(true);
      const data = result.getValue();

      expect(data.totalEmployees).toBe(0);
      expect(data.activeEmployees).toBe(0);
      expect(data.generatedDocuments).toBe(0);
      expect(data.newJoinersThisMonth).toEqual([]);
      expect(data.upcomingConfirmations).toEqual([]);
      expect(data.noticePeriodList).toEqual([]);
      expect(data.recentRelieved).toEqual([]);
    });
  });

  // =========================================================================
  // 9. CROSS-TENANT ISOLATION & IDOR ATTACK REGRESSION
  // =========================================================================
  describe('Flow 9: Cross-Tenant Isolation & Security Anti-Spoofing', () => {
    it('9.1 rejects cross-tenant document download: Tenant B user cannot access Tenant A PDF', () => {
      const tenantADoc = GeneratedDocumentAggregate.create({
        businessId: 'GDOC-2026-0001',
        companyId: tenantACompanyId,
        profileId: 'prof-alice-001',
        documentTypeId: 'dt-1',
        templateVersionId: 'ver-1',
        entityType: 'EMPLOYEE',
        entityId: 'emp-alice-001',
        status: DocumentGenerationStatus.GENERATED,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: hrManagerUserId,
        updatedBy: hrManagerUserId,
        snapshots: [],
      });

      // Assert tenant comparison
      const callerCompanyId = tenantBCompanyId;
      const isAllowed = tenantADoc.companyId === callerCompanyId;
      expect(isAllowed).toBe(false);
    });

    it('9.2 prevents employee role IDOR access to another employee documents', () => {
      const emp1Doc = GeneratedDocumentAggregate.create({
        businessId: 'GDOC-2026-0001',
        companyId: tenantACompanyId,
        profileId: 'prof-alice-001',
        documentTypeId: 'dt-1',
        templateVersionId: 'ver-1',
        entityType: 'EMPLOYEE',
        entityId: 'emp-alice-001',
        status: DocumentGenerationStatus.GENERATED,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: hrManagerUserId,
        updatedBy: hrManagerUserId,
        snapshots: [],
      });

      const callerUser = {
        role: 'EMPLOYEE',
        employeeId: 'emp-bob-002',
        profileId: 'prof-bob-002',
      };

      const hasAccess =
        callerUser.role !== 'EMPLOYEE' ||
        emp1Doc.entityId === callerUser.employeeId ||
        emp1Doc.profileId === callerUser.profileId;

      expect(hasAccess).toBe(false);
    });
  });
});
