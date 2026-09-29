import { TemplateAggregate } from '../../src/domain/aggregates/TemplateAggregate';
import { Identifier } from '../../../../kernel/domain/Identifier';
import { TemplateStatus, TemplateVersionStatus } from '../../src/domain/enums/DocumentEnums';
import { TemplateVersionEntity } from '../../src/domain/entities/TemplateVersionEntity';
import { SaveHtmlTemplateVersionHandler } from '../../src/application/commands/SaveHtmlTemplateVersion/SaveHtmlTemplateVersionHandler';
import { SaveHtmlTemplateVersionCommand } from '../../src/application/commands/SaveHtmlTemplateVersion/SaveHtmlTemplateVersionCommand';
import { PreviewTemplateHandler } from '../../src/application/queries/PreviewTemplate/PreviewTemplateHandler';
import { PreviewTemplateQuery } from '../../src/application/queries/PreviewTemplate/PreviewTemplateQuery';
import { PlaceholderRegistryService } from '../../src/domain/services/PlaceholderRegistryService';
import { AutomaticResolverService } from '../../src/domain/services/AutomaticResolverService';
import { PreviewDataProvider } from '../../src/infrastructure/data/PreviewDataProvider';
import { IEntityDataProvider } from '../../src/domain/ports/IEntityDataProvider';
import { ITemplateRepository } from '../../src/domain/repositories/ITemplateRepository';
import { IUnitOfWork } from '../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../kernel/application/services/IBusinessIdGenerator';
import { TemplatePlaceholderVO } from '../../src/domain/value-objects/TemplatePlaceholderVO';

describe('Step 6 — Template Editor & Placeholder System Specification', () => {
  const COMPANY_A = 'company-tenant-aaa';
  const COMPANY_B = 'company-tenant-bbb';
  const PERFORMED_BY = 'admin-user-001';

  // Mock PrismaService for PlaceholderRegistryService
  const mockPrisma = {
    fieldDefinition: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    company: {
      findUnique: jest.fn().mockResolvedValue({ name: 'Smatal Corp', website: 'https://smatal.com' }),
    },
    employee: {
      findUnique: jest.fn(),
    },
  } as any;

  let placeholderRegistry: PlaceholderRegistryService;
  let automaticResolver: AutomaticResolverService;

  beforeEach(() => {
    jest.clearAllMocks();
    placeholderRegistry = new PlaceholderRegistryService(mockPrisma);
    automaticResolver = new AutomaticResolverService(placeholderRegistry);
  });

  describe('1. PlaceholderRegistryService', () => {
    it('should register all standard HR system placeholders', async () => {
      const placeholders = await placeholderRegistry.getPlaceholders(COMPANY_A);
      expect(placeholders.length).toBeGreaterThanOrEqual(30);

      const keys = placeholders.map((p) => p.key);

      // Employee identity
      expect(keys).toContain('employee.firstName');
      expect(keys).toContain('employee.lastName');
      expect(keys).toContain('employee.fullName');
      expect(keys).toContain('employee.employeeId');
      expect(keys).toContain('employee.employeeNumber');

      // Employment
      expect(keys).toContain('employee.designation');
      expect(keys).toContain('employee.department');
      expect(keys).toContain('employee.employmentType');
      expect(keys).toContain('employee.joiningDate');
      expect(keys).toContain('employee.probationEndDate');
      expect(keys).toContain('employee.confirmationDate');
      expect(keys).toContain('employee.resignationDate');
      expect(keys).toContain('employee.lastWorkingDate');
      expect(keys).toContain('employee.salary');
      expect(keys).toContain('employee.offerSalary');

      // Personal
      expect(keys).toContain('employee.personalEmail');
      expect(keys).toContain('employee.phone');
      expect(keys).toContain('employee.dateOfBirth');
      expect(keys).toContain('employee.gender');
      expect(keys).toContain('employee.address');

      // Company
      expect(keys).toContain('company.name');
      expect(keys).toContain('company.website');
      expect(keys).toContain('company.address');
      expect(keys).toContain('company.phone');
      expect(keys).toContain('company.email');
      expect(keys).toContain('company.authorizedPerson');
      expect(keys).toContain('company.authorizedPersonDesignation');

      // Candidate
      expect(keys).toContain('candidate.firstName');
      expect(keys).toContain('candidate.lastName');
      expect(keys).toContain('candidate.fullName');

      // System
      expect(keys).toContain('system.currentDate');
      expect(keys).toContain('system.currentUser');
    });

    it('should filter placeholders by entity', async () => {
      const employeeOnly = await placeholderRegistry.getPlaceholders(COMPANY_A, undefined, 'EMPLOYEE');
      expect(employeeOnly.every((p) => p.entity === 'EMPLOYEE')).toBe(true);
      expect(employeeOnly.some((p) => p.key === 'employee.firstName')).toBe(true);
      expect(employeeOnly.some((p) => p.key === 'company.name')).toBe(false);

      const companyOnly = await placeholderRegistry.getPlaceholders(COMPANY_A, undefined, 'COMPANY');
      expect(companyOnly.every((p) => p.entity === 'COMPANY')).toBe(true);
      expect(companyOnly.some((p) => p.key === 'company.name')).toBe(true);
      expect(companyOnly.some((p) => p.key === 'employee.firstName')).toBe(false);
    });

    it('should search placeholders by label, key, or description', async () => {
      const salarySearchResults = await placeholderRegistry.getPlaceholders(COMPANY_A, 'salary');
      expect(salarySearchResults.length).toBeGreaterThan(0);
      expect(salarySearchResults.every((p) =>
        p.key.includes('salary') || p.label.toLowerCase().includes('salary') || (p.description && p.description.toLowerCase().includes('salary'))
      )).toBe(true);
    });
  });

  describe('2. SaveHtmlTemplateVersionHandler', () => {
    let mockTemplateRepo: jest.Mocked<ITemplateRepository>;
    let mockUnitOfWork: IUnitOfWork;
    let mockIdGenerator: IBusinessIdGenerator;
    let handler: SaveHtmlTemplateVersionHandler;

    const createTestTemplate = (companyId: string) => {
      return TemplateAggregate.create(
        {
          businessId: 'TMPL-001',
          companyId,
          documentTypeId: 'dt-offer-letter',
          name: 'Offer Letter Template',
          description: 'Standard company offer letter',
          status: TemplateStatus.DRAFT,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: PERFORMED_BY,
          updatedBy: PERFORMED_BY,
          versions: [],
        },
        new Identifier<string>('tmpl-123'),
      );
    };

    beforeEach(() => {
      mockTemplateRepo = {
        findById: jest.fn(),
        findByDocumentType: jest.fn(),
        findActiveByDocumentType: jest.fn(),
        save: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn(),
      } as any;

      mockUnitOfWork = {
        withTransaction: jest.fn().mockImplementation((cb) => cb()),
      } as any;

      mockIdGenerator = {
        generate: jest.fn().mockResolvedValue('TVER-2026-0001'),
      };

      handler = new SaveHtmlTemplateVersionHandler(
        mockTemplateRepo,
        mockUnitOfWork,
        mockIdGenerator,
        placeholderRegistry,
      );
    });

    it('should save a valid HTML template version and detect placeholders', async () => {
      const template = createTestTemplate(COMPANY_A);
      mockTemplateRepo.findById.mockResolvedValue(template);

      const htmlContent = `
        <h1>Offer Letter</h1>
        <p>Dear {{employee.firstName}} {{employee.lastName}},</p>
        <p>We are pleased to offer you the position of {{employee.designation}} at {{company.name}}.</p>
        <p>Your joining date will be {{employee.joiningDate}} with a salary of {{employee.salary}}.</p>
      `;

      const command = new SaveHtmlTemplateVersionCommand(
        'tmpl-123',
        COMPANY_A,
        htmlContent,
        'Initial version created in browser editor',
        PERFORMED_BY,
      );

      const result = await handler.execute(command);

      expect(result.isSuccess).toBe(true);
      const data = result.getValue();
      expect(data.versionNumber).toBe(1);
      expect(data.detectedPlaceholders).toContain('employee.firstName');
      expect(data.detectedPlaceholders).toContain('employee.lastName');
      expect(data.detectedPlaceholders).toContain('employee.designation');
      expect(data.detectedPlaceholders).toContain('company.name');
      expect(data.detectedPlaceholders).toContain('employee.joiningDate');
      expect(data.detectedPlaceholders).toContain('employee.salary');
      expect(template.versions.length).toBe(1);
      expect(template.versions[0].contentType).toBe('html');
      expect(template.versions[0].content).toBe(htmlContent);
      expect(mockTemplateRepo.save).toHaveBeenCalledWith(template);
    });

    it('should reject template if any unknown placeholder is used', async () => {
      const template = createTestTemplate(COMPANY_A);
      mockTemplateRepo.findById.mockResolvedValue(template);

      const invalidHtml = `
        <h1>Welcome</h1>
        <p>Hello {{employee.firstName}}, your crypto wallet is {{employee.cryptoWalletBalance}}</p>
        <p>Favorite food: {{personal.favoriteFood}}</p>
      `;

      const command = new SaveHtmlTemplateVersionCommand(
        'tmpl-123',
        COMPANY_A,
        invalidHtml,
        'Invalid placeholder test',
        PERFORMED_BY,
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Unknown placeholders detected');
      expect(result.errorValue).toContain('{{employee.cryptoWalletBalance}}');
      expect(result.errorValue).toContain('{{personal.favoriteFood}}');
      expect(mockTemplateRepo.save).not.toHaveBeenCalled();
    });

    it('should reject empty HTML template content', async () => {
      const command = new SaveHtmlTemplateVersionCommand(
        'tmpl-123',
        COMPANY_A,
        '   ',
        'Empty test',
        PERFORMED_BY,
      );

      const result = await handler.execute(command);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('cannot be empty');
    });

    it('should enforce tenant isolation and reject modifications from a different company', async () => {
      // Template belongs to Company A
      const template = createTestTemplate(COMPANY_A);
      mockTemplateRepo.findById.mockResolvedValue(template);

      // Caller is from Company B
      const command = new SaveHtmlTemplateVersionCommand(
        'tmpl-123',
        COMPANY_B,
        '<p>Valid content for {{employee.firstName}}</p>',
        'Cross-tenant attempt',
        PERFORMED_BY,
      );

      const result = await handler.execute(command);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Unauthorized to modify template');
      expect(mockTemplateRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('3. PreviewTemplateHandler (HTML Path — No PizZip / No Crash)', () => {
    let mockTemplateRepo: jest.Mocked<ITemplateRepository>;
    let mockLiveProvider: jest.Mocked<IEntityDataProvider>;
    let previewHandler: PreviewTemplateHandler;

    const createTemplateWithHtmlVersion = (companyId: string, htmlContent: string) => {
      const tmpl = TemplateAggregate.create(
        {
          businessId: 'TMPL-001',
          companyId,
          documentTypeId: 'dt-offer-letter',
          name: 'Offer Letter Template',
          status: TemplateStatus.PUBLISHED,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: PERFORMED_BY,
          updatedBy: PERFORMED_BY,
          versions: [],
        },
        new Identifier<string>('tmpl-123'),
      );

      const version = TemplateVersionEntity.create(
        {
          businessId: 'TVER-001',
          templateId: 'tmpl-123',
          versionNumber: 1,
          content: htmlContent,
          contentType: 'html',
          status: TemplateVersionStatus.PUBLISHED,
          placeholders: [],
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: PERFORMED_BY,
          updatedBy: PERFORMED_BY,
        },
        new Identifier<string>('ver-1'),
      );

      tmpl.addVersion(version);
      return tmpl;
    };

    beforeEach(() => {
      mockTemplateRepo = {
        findById: jest.fn(),
        findByDocumentType: jest.fn(),
        findActiveByDocumentType: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      } as any;

      mockLiveProvider = {
        getCompanyName: jest.fn().mockResolvedValue('Live Corp'),
        getCompanyWebsite: jest.fn().mockResolvedValue('https://live.corp'),
        getCompanyAddress: jest.fn().mockResolvedValue('123 Live St'),
        getCompanyPhone: jest.fn().mockResolvedValue('+91 9999999999'),
        getCompanyEmail: jest.fn().mockResolvedValue('hr@live.corp'),
        getCompanyAuthorizedPerson: jest.fn().mockResolvedValue('Admin Person'),
        getCompanyAuthorizedPersonDesignation: jest.fn().mockResolvedValue('VP HR'),
        getEmployeeFirstName: jest.fn().mockResolvedValue('LiveJohn'),
        getEmployeeLastName: jest.fn().mockResolvedValue('LiveDoe'),
        getEmployeeFullName: jest.fn().mockResolvedValue('LiveJohn LiveDoe'),
        getEmployeeId: jest.fn().mockResolvedValue('EMP-LIVE-1'),
        getEmployeeNumber: jest.fn().mockResolvedValue('EMP001'),
        getEmployeeDesignation: jest.fn().mockResolvedValue('Lead Engineer'),
        getEmployeeDepartment: jest.fn().mockResolvedValue('Product'),
        getEmployeeEmploymentType: jest.fn().mockResolvedValue('Full-time'),
        getEmployeeJoiningDate: jest.fn().mockResolvedValue('10 October 2024'),
        getEmployeeProbationEndDate: jest.fn().mockResolvedValue('10 January 2025'),
        getEmployeeConfirmationDate: jest.fn().mockResolvedValue('10 January 2025'),
        getEmployeeResignationDate: jest.fn().mockResolvedValue(''),
        getEmployeeLastWorkingDate: jest.fn().mockResolvedValue(''),
        getEmployeeSalary: jest.fn().mockResolvedValue('₹20,00,000 per annum'),
        getEmployeeOfferSalary: jest.fn().mockResolvedValue('₹20,00,000 per annum'),
        getEmployeePersonalEmail: jest.fn().mockResolvedValue('live@gmail.com'),
        getEmployeePhone: jest.fn().mockResolvedValue('+91 8888888888'),
        getEmployeeDateOfBirth: jest.fn().mockResolvedValue('05 May 1992'),
        getEmployeeGender: jest.fn().mockResolvedValue('Male'),
        getEmployeeAddress: jest.fn().mockResolvedValue('456 Live Ave'),
        getCandidateFirstName: jest.fn().mockResolvedValue('LiveCandidateFirst'),
        getCandidateLastName: jest.fn().mockResolvedValue('LiveCandidateLast'),
        getCustomFieldValue: jest.fn().mockResolvedValue('LiveCustomVal'),
      };

      const mockDocxGenerator = {} as any;
      const mockHtmlConverter = {} as any;
      const mockPdfConverter = {} as any;
      const mockStorageFactory = {} as any;

      previewHandler = new PreviewTemplateHandler(
        mockTemplateRepo,
        automaticResolver,
        mockDocxGenerator,
        mockHtmlConverter,
        mockPdfConverter,
        mockStorageFactory,
        mockLiveProvider as any,
      );
    });

    it('should preview HTML template with sample data without crashing or invoking PizZip', async () => {
      const htmlContent = `
        <div class="letter">
          <h1>Joining Letter</h1>
          <p>Welcome {{employee.firstName}} {{employee.lastName}}!</p>
          <p>Your designation is {{employee.designation}} at {{company.name}}.</p>
          <p>Annual CTC: {{employee.salary}}.</p>
        </div>
      `;

      const template = createTemplateWithHtmlVersion(COMPANY_A, htmlContent);
      mockTemplateRepo.findById.mockResolvedValue(template);

      const query = new PreviewTemplateQuery(
        'tmpl-123',
        COMPANY_A,
        'SAMPLE',
        'HTML',
      );

      const result = await previewHandler.execute(query);

      expect(result.isSuccess).toBe(true);
      const data = result.getValue();
      expect(data.html).toContain('Welcome John Doe!');
      expect(data.html).toContain('Your designation is Software Engineer at Smatal Technologies.');
      expect(data.html).toContain('Annual CTC: ₹12,00,000 per annum.');
      expect(data.resolvedKeys).toContain('employee.firstName');
      expect(data.resolvedKeys).toContain('employee.lastName');
      expect(data.resolvedKeys).toContain('employee.designation');
      expect(data.resolvedKeys).toContain('company.name');
      expect(data.resolvedKeys).toContain('employee.salary');
      expect(data.unresolvedKeys).toHaveLength(0);
    });

    it('should preview HTML template with LIVE employee data when mode is LIVE', async () => {
      const htmlContent = `
        <p>Dear {{employee.fullName}}, welcome to {{company.name}} in {{employee.department}}.</p>
      `;

      const template = createTemplateWithHtmlVersion(COMPANY_A, htmlContent);
      mockTemplateRepo.findById.mockResolvedValue(template);

      const query = new PreviewTemplateQuery(
        'tmpl-123',
        COMPANY_A,
        'LIVE',
        'HTML',
        undefined,
        'emp-live-id',
      );

      const result = await previewHandler.execute(query);

      expect(result.isSuccess).toBe(true);
      const data = result.getValue();
      expect(data.html).toContain('Dear LiveJohn LiveDoe, welcome to Live Corp in Product.');
      expect(mockLiveProvider.getEmployeeFullName).toHaveBeenCalled();
      expect(mockLiveProvider.getCompanyName).toHaveBeenCalled();
    });

    it('should prevent HTML injection by escaping placeholder values in preview', async () => {
      const htmlContent = `<p>Employee: {{employee.firstName}}</p>`;
      const template = createTemplateWithHtmlVersion(COMPANY_A, htmlContent);
      mockTemplateRepo.findById.mockResolvedValue(template);

      // Malicious value returned from provider
      mockLiveProvider.getEmployeeFirstName.mockResolvedValue('<script>alert("XSS")</script>');

      const query = new PreviewTemplateQuery(
        'tmpl-123',
        COMPANY_A,
        'LIVE',
        'HTML',
        undefined,
        'emp-live-id',
      );

      const result = await previewHandler.execute(query);
      expect(result.isSuccess).toBe(true);
      const data = result.getValue();
      expect(data.html).not.toContain('<script>');
      expect(data.html).toContain('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('should enforce tenant isolation in preview', async () => {
      const template = createTemplateWithHtmlVersion(COMPANY_A, '<p>Secret</p>');
      mockTemplateRepo.findById.mockResolvedValue(template);

      // Company B attempts to preview Company A template
      const query = new PreviewTemplateQuery(
        'tmpl-123',
        COMPANY_B,
        'SAMPLE',
        'HTML',
      );

      const result = await previewHandler.execute(query);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Template not found or unauthorized');
    });

    it('should allow previewing a draft template when no published version exists', async () => {
      const tmpl = TemplateAggregate.create(
        {
          businessId: 'TMPL-001',
          companyId: COMPANY_A,
          documentTypeId: 'dt-offer-letter',
          name: 'Draft Only Template',
          status: TemplateStatus.DRAFT,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: PERFORMED_BY,
          updatedBy: PERFORMED_BY,
          versions: [],
        },
        new Identifier<string>('tmpl-draft-1'),
      );

      const draftVersion = TemplateVersionEntity.create(
        {
          businessId: 'TVER-001',
          templateId: 'tmpl-draft-1',
          versionNumber: 1,
          content: '<p>Draft preview for {{employee.firstName}}</p>',
          contentType: 'html',
          status: TemplateVersionStatus.DRAFT,
          placeholders: [],
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: PERFORMED_BY,
          updatedBy: PERFORMED_BY,
        },
        new Identifier<string>('ver-draft-1'),
      );

      tmpl.addVersion(draftVersion);
      mockTemplateRepo.findById.mockResolvedValue(tmpl);

      const query = new PreviewTemplateQuery(
        'tmpl-draft-1',
        COMPANY_A,
        'SAMPLE',
        'HTML',
      );

      const result = await previewHandler.execute(query);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().html).toContain('Draft preview for John');
    });
  });

  describe('4. AutomaticResolverService', () => {
    it('should resolve all system placeholders with appropriate dataProvider method', async () => {
      const mockDataProvider: IEntityDataProvider = {
        getCompanyName: jest.fn().mockResolvedValue('Acme Corp'),
        getCompanyWebsite: jest.fn().mockResolvedValue('https://acme.org'),
        getCompanyAddress: jest.fn().mockResolvedValue('777 Industrial Way'),
        getCompanyPhone: jest.fn().mockResolvedValue('1234567890'),
        getCompanyEmail: jest.fn().mockResolvedValue('contact@acme.org'),
        getCompanyAuthorizedPerson: jest.fn().mockResolvedValue('Jane Boss'),
        getCompanyAuthorizedPersonDesignation: jest.fn().mockResolvedValue('Director'),
        getEmployeeFirstName: jest.fn().mockResolvedValue('Bob'),
        getEmployeeLastName: jest.fn().mockResolvedValue('Smith'),
        getEmployeeFullName: jest.fn().mockResolvedValue('Bob Smith'),
        getEmployeeId: jest.fn().mockResolvedValue('EMP-100'),
        getEmployeeNumber: jest.fn().mockResolvedValue('00100'),
        getEmployeeDesignation: jest.fn().mockResolvedValue('DevOps Specialist'),
        getEmployeeDepartment: jest.fn().mockResolvedValue('Infrastructure'),
        getEmployeeEmploymentType: jest.fn().mockResolvedValue('Full-time'),
        getEmployeeJoiningDate: jest.fn().mockResolvedValue('01-01-2024'),
        getEmployeeProbationEndDate: jest.fn().mockResolvedValue('01-04-2024'),
        getEmployeeConfirmationDate: jest.fn().mockResolvedValue('01-04-2024'),
        getEmployeeResignationDate: jest.fn().mockResolvedValue(''),
        getEmployeeLastWorkingDate: jest.fn().mockResolvedValue(''),
        getEmployeeSalary: jest.fn().mockResolvedValue('₹15,00,000 per annum'),
        getEmployeeOfferSalary: jest.fn().mockResolvedValue('₹15,00,000 per annum'),
        getEmployeePersonalEmail: jest.fn().mockResolvedValue('bob@gmail.com'),
        getEmployeePhone: jest.fn().mockResolvedValue('9988776655'),
        getEmployeeDateOfBirth: jest.fn().mockResolvedValue('15-08-1995'),
        getEmployeeGender: jest.fn().mockResolvedValue('Male'),
        getEmployeeAddress: jest.fn().mockResolvedValue('10 Downing St'),
        getCandidateFirstName: jest.fn().mockResolvedValue('Alice'),
        getCandidateLastName: jest.fn().mockResolvedValue('Wonder'),
        getCustomFieldValue: jest.fn().mockResolvedValue('CustomVal'),
      };

      const keysToResolve = [
        'company.name',
        'employee.firstName',
        'employee.designation',
        'system.currentDate',
      ];

      const resolution = await automaticResolver.resolvePlaceholders(
        keysToResolve,
        {
          companyId: COMPANY_A,
          profileId: 'emp-1',
          employeeId: 'emp-1',
        },
        mockDataProvider,
      );

      expect(resolution.resolvedKeys).toEqual(expect.arrayContaining(keysToResolve));
      expect(resolution.resolvedValues['company.name']).toBe('Acme Corp');
      expect(resolution.resolvedValues['employee.firstName']).toBe('Bob');
      expect(resolution.resolvedValues['employee.designation']).toBe('DevOps Specialist');
      expect(resolution.resolvedValues['system.currentDate']).toBeTruthy();
      expect(resolution.unresolvedKeys).toHaveLength(0);
      expect(resolution.errors).toHaveLength(0);
    });

    it('should report unknown placeholders in errors and unresolvedKeys', async () => {
      const mockDataProvider = {} as any;
      const resolution = await automaticResolver.resolvePlaceholders(
        ['nonexistent.placeholder'],
        {
          companyId: COMPANY_A,
          profileId: '',
        },
        mockDataProvider,
      );

      expect(resolution.unresolvedKeys).toContain('nonexistent.placeholder');
      expect(resolution.errors.some((e) => e.includes('Unknown placeholder: nonexistent.placeholder'))).toBe(true);
    });
  });
});
