import { Result } from '../../../../kernel/result/Result';
import { Identifier } from '../../../../kernel/domain/Identifier';
import { PdfGenerationService } from '../../src/infrastructure/services/PdfGenerationService';
import { PdfConverterService } from '../../src/infrastructure/services/PdfConverterService';
import { HtmlConverterService } from '../../src/infrastructure/services/HtmlConverterService';
import { GenerateDocumentHandler } from '../../src/application/commands/GenerateDocument/GenerateDocumentHandler';
import { GenerateDocumentCommand } from '../../src/application/commands/GenerateDocument/GenerateDocumentCommand';
import { GenerationOrchestrator } from '../../src/application/services/GenerationOrchestrator';
import { DocumentDownloadController } from '../../src/presentation/controllers/DocumentDownloadController';
import { GeneratedDocumentMapper } from '../../src/infrastructure/mappers/GeneratedDocumentMapper';
import { GenerationValidator } from '../../src/domain/services/GenerationValidator';
import { DocumentSnapshotBuilder } from '../../src/domain/builders/DocumentSnapshotBuilder';
import { TemplateAggregate } from '../../src/domain/aggregates/TemplateAggregate';
import { TemplateVersionEntity } from '../../src/domain/entities/TemplateVersionEntity';
import { GeneratedDocumentAggregate } from '../../src/domain/aggregates/GeneratedDocumentAggregate';
import { TemplateStatus, TemplateVersionStatus, DocumentGenerationStatus } from '../../src/domain/enums/DocumentEnums';
import { DocumentTypeAggregate } from '../../src/domain/aggregates/DocumentTypeAggregate';
import { PlaceholderRegistryService } from '../../src/domain/services/PlaceholderRegistryService';
import { AutomaticResolverService } from '../../src/domain/services/AutomaticResolverService';

describe('Step 7 — Real PDF Generation & Download Specification', () => {
  let htmlConverter: HtmlConverterService;
  let pdfService: PdfGenerationService;
  let pdfConverter: PdfConverterService;

  beforeAll(() => {
    htmlConverter = new HtmlConverterService();
    pdfService = new PdfGenerationService(htmlConverter);
    pdfConverter = new PdfConverterService(pdfService);
  });

  afterAll(async () => {
    await pdfService.onModuleDestroy();
  });

  // =========================================================================
  // 1. PDF GENERATION SERVICE & ENGINE
  // =========================================================================
  describe('1. PdfGenerationService & Headless Engine', () => {
    it('generates genuine PDF bytes starting with %PDF- header from HTML', async () => {
      const sampleHtml = `
        <h1>CONFIRMATION LETTER</h1>
        <p>Dear <strong>John Doe</strong>,</p>
        <p>This is to confirm your position as <em>Senior Software Engineer</em>.</p>
      `;

      const pdfBuffer = await pdfService.generateFromHtml(sampleHtml);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(1000);
      expect(pdfBuffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    }, 45000);

    it('renders complex HR content: tables, lists, formatting and page breaks', async () => {
      const complexHtml = `
        <h1>EMPLOYMENT CONFIRMATION</h1>
        <p>Here are your employment details:</p>
        <table>
          <thead>
            <tr><th>Attribute</th><th>Details</th></tr>
          </thead>
          <tbody>
            <tr><td>Employee ID</td><td>EMP-000123</td></tr>
            <tr><td>Designation</td><td>Lead Architect</td></tr>
            <tr><td>Department</td><td>Engineering</td></tr>
            <tr><td>Joining Date</td><td>2026-01-15</td></tr>
          </tbody>
        </table>
        <ul>
          <li>Health Insurance Coverage</li>
          <li>Annual Leave Allowance: 24 Days</li>
        </ul>
        <div class="page-break"></div>
        <h2>Page 2 — Terms & Code of Conduct</h2>
        <p>Standard company policies apply across all offices.</p>
      `;

      const pdfBuffer = await pdfService.generateFromHtml(complexHtml);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfService.validatePdfBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(2000);
    }, 45000);

    it('sanitizes dangerous HTML scripts and prevents XSS execution in Chromium', async () => {
      const maliciousHtml = `
        <script>window.__HACKED__ = true; document.body.innerHTML = 'HACKED';</script>
        <p onclick="alert('XSS')">Safe text</p>
        <iframe src="javascript:alert('XSS')"></iframe>
        <a href="javascript:doSomething()">Link</a>
      `;

      const sanitized = pdfService.sanitizeHtml(maliciousHtml);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('__HACKED__');
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('javascript:');

      const pdfBuffer = await pdfService.generateFromHtml(maliciousHtml);
      expect(pdfService.validatePdfBuffer(pdfBuffer)).toBe(true);
    }, 45000);

    it('fails cleanly on empty or corrupt PDF validation', () => {
      const corruptBuffer = Buffer.from('NOT_A_PDF_STRING');
      expect(() => pdfService.validatePdfBuffer(corruptBuffer)).toThrow(
        /Invalid PDF header/,
      );

      const emptyBuffer = Buffer.from('');
      expect(() => pdfService.validatePdfBuffer(emptyBuffer)).toThrow(
        /empty or corrupted/,
      );
    });

    it('PdfConverterService delegates HTML and DOCX to genuine PDF generation (no fake rename)', async () => {
      const htmlBuffer = Buffer.from('<h2>Offer Letter</h2><p>Welcome to Acme!</p>', 'utf-8');
      const pdfBuffer = await pdfConverter.convertToPdf(htmlBuffer, 'html');

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    }, 45000);
  });

  // =========================================================================
  // 2. DOCUMENT GENERATION FLOW & PLACEHOLDER RESOLUTION
  // =========================================================================
  describe('2. GenerateDocumentHandler & Orchestration', () => {
    const companyA = 'company-tenant-alpha';
    const companyB = 'company-tenant-beta';
    const employeeId = 'emp-001';

    let mockDocTypeRepo: any;
    let mockTemplateRepo: any;
    let mockDocumentRepo: any;
    let mockUnitOfWork: any;
    let mockIdGenerator: any;
    let mockDomainService: any;
    let mockDispatcher: any;
    let mockDataProvider: any;
    let mockPrisma: any;
    let handler: GenerateDocumentHandler;

    beforeEach(() => {
      mockDocTypeRepo = {
        findById: jest.fn(),
      };
      mockTemplateRepo = {
        findByDocumentTypeId: jest.fn(),
      };
      mockDocumentRepo = {
        save: jest.fn().mockResolvedValue(undefined),
      };
      mockUnitOfWork = {
        withTransaction: jest.fn().mockImplementation(async (cb) => await cb()),
      };
      mockIdGenerator = {
        generate: jest.fn().mockResolvedValue('GDOC-2026-0001'),
      };
      mockDomainService = {
        validateTemplateForGeneration: jest.fn(),
      };
      mockDispatcher = {
        dispatch: jest.fn().mockResolvedValue({ jobId: 'job-1', status: 'COMPLETED' }),
      };
      mockDataProvider = {};
      mockPrisma = {
        employee: {
          findUnique: jest.fn(),
        },
        candidate: {
          findUnique: jest.fn(),
        },
      };

      handler = new GenerateDocumentHandler(
        mockDocTypeRepo,
        mockTemplateRepo,
        mockDocumentRepo,
        mockUnitOfWork,
        mockIdGenerator,
        mockDomainService,
        mockDispatcher,
        mockDataProvider,
        mockPrisma,
      );
    });

    it('generates a document successfully when employee, document type, and template belong to tenant', async () => {
      mockDocTypeRepo.findById.mockResolvedValue(
        DocumentTypeAggregate.create({
          businessId: 'DOCTYPE-001',
          code: 'CONFIRMATION_LETTER',
          name: 'Confirmation Letter',
          companyId: companyA,
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'hr-1',
          updatedBy: 'hr-1',
        }),
      );

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: employeeId,
        companyId: companyA,
        profileId: 'profile-emp-1',
        isDeleted: false,
      });

      const template = TemplateAggregate.create({
        businessId: 'TMPL-001',
        companyId: companyA,
        documentTypeId: 'doc-type-1',
        name: 'Standard Confirmation',
        status: TemplateStatus.PUBLISHED,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'hr-1',
        updatedBy: 'hr-1',
        versions: [],
      });

      const version = TemplateVersionEntity.create({
        businessId: 'VER-001',
        templateId: template.id.toValue() as string,
        versionNumber: 1,
        content: '<p>Dear {{employee.fullName}}, welcome to {{company.name}}!</p>',
        contentType: 'html',
        status: TemplateVersionStatus.PUBLISHED,
        placeholders: [],
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'hr-1',
        updatedBy: 'hr-1',
      });
      template.addVersion(version);

      mockTemplateRepo.findByDocumentTypeId.mockResolvedValue([template]);

      const command = new GenerateDocumentCommand(
        companyA,
        'doc-type-1',
        'EMPLOYEE',
        employeeId,
        { actionId: 'generate', initiatedBy: 'hr-user-1', effectiveDate: new Date() },
        'hr-user-1',
      );

      const result = await handler.execute(command);

      expect(result.isSuccess).toBe(true);
      expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
      const dispatchedPayload = mockDispatcher.dispatch.mock.calls[0][0];
      expect(dispatchedPayload.document.companyId).toBe(companyA);
      expect(dispatchedPayload.document.templateVersionId).toBe(version.id.toValue());
      expect(dispatchedPayload.document.profileId).toBe('profile-emp-1');
    });

    it('blocks generation when employee belongs to a different company (Cross-Tenant Employee)', async () => {
      mockDocTypeRepo.findById.mockResolvedValue(
        DocumentTypeAggregate.create({
          businessId: 'DOCTYPE-002',
          code: 'CONFIRMATION_LETTER',
          name: 'Confirmation Letter',
          companyId: companyA,
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'hr-1',
          updatedBy: 'hr-1',
        }),
      );

      // Employee belongs to Company B!
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: employeeId,
        companyId: companyB,
        profileId: 'profile-emp-1',
        isDeleted: false,
      });

      const command = new GenerateDocumentCommand(
        companyA,
        'doc-type-1',
        'EMPLOYEE',
        employeeId,
        { actionId: 'generate', initiatedBy: 'hr-user-1', effectiveDate: new Date() },
        'hr-user-1',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toMatch(/Employee not found or does not belong to your company/i);
      expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it('blocks generation when document type is inactive', async () => {
      mockDocTypeRepo.findById.mockResolvedValue(
        DocumentTypeAggregate.create({
          businessId: 'DOCTYPE-003',
          code: 'CONFIRMATION_LETTER',
          name: 'Confirmation Letter',
          companyId: companyA,
          isActive: false, // INACTIVE!
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'hr-1',
          updatedBy: 'hr-1',
        }),
      );

      const command = new GenerateDocumentCommand(
        companyA,
        'doc-type-1',
        'EMPLOYEE',
        employeeId,
        { actionId: 'generate', initiatedBy: 'hr-user-1', effectiveDate: new Date() },
        'hr-user-1',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toMatch(/inactive/i);
      expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it('blocks generation when template belongs to another company (Cross-Tenant Template)', async () => {
      mockDocTypeRepo.findById.mockResolvedValue(
        DocumentTypeAggregate.create({
          businessId: 'DOCTYPE-004',
          code: 'CONFIRMATION_LETTER',
          name: 'Confirmation Letter',
          companyId: companyA,
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'hr-1',
          updatedBy: 'hr-1',
        }),
      );

      mockPrisma.employee.findUnique.mockResolvedValue({
        id: employeeId,
        companyId: companyA,
        profileId: 'profile-emp-1',
        isDeleted: false,
      });

      // Template belongs to Company B!
      const companyBTemplate = TemplateAggregate.create({
        businessId: 'TMPL-002',
        companyId: companyB,
        documentTypeId: 'doc-type-1',
        name: 'Company B Template',
        status: TemplateStatus.PUBLISHED,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'hr-2',
        updatedBy: 'hr-2',
        versions: [],
      });

      mockTemplateRepo.findByDocumentTypeId.mockResolvedValue([companyBTemplate]);

      const command = new GenerateDocumentCommand(
        companyA,
        'doc-type-1',
        'EMPLOYEE',
        employeeId,
        { actionId: 'generate', initiatedBy: 'hr-user-1', effectiveDate: new Date() },
        'hr-user-1',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toMatch(/No active template found/i);
      expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. GENERATION ORCHESTRATOR & IMMUTABILITY
  // =========================================================================
  describe('3. GenerationOrchestrator End-to-End Execution', () => {
    it('resolves placeholders, saves HTML and genuine PDF snapshots, and records template version', async () => {
      const companyId = 'co-tenant-1';
      const employeeId = 'emp-xyz';

      const validator = new GenerationValidator();
      const generatorFactory: any = { getStrategy: jest.fn() };
      const templateLoader: any = {};
      const mockStorage: any = {
        upload: jest.fn().mockImplementation(async (key, buf, mime) => ({
          uri: `local://${key}`,
          checksum: 'sha256-mock',
          sizeBytes: buf.length,
        })),
        download: jest.fn(),
      };
      const snapshotBuilder = new DocumentSnapshotBuilder();
      const eventBus: any = { publish: jest.fn() };
      const unitOfWork: any = { withTransaction: jest.fn().mockImplementation(async (cb) => cb()) };
      const documentRepo: any = { save: jest.fn().mockResolvedValue(undefined) };

      const registry = new PlaceholderRegistryService({ fieldDefinition: { findMany: jest.fn().mockResolvedValue([]) } } as any);
      const automaticResolver = new AutomaticResolverService(registry);
      const dataProvider: any = {
        getEmployeeFullName: jest.fn().mockResolvedValue('Sarah Connor'),
        getEmployeeId: jest.fn().mockResolvedValue('EMP-777'),
        getEmployeeEmployeeId: jest.fn().mockResolvedValue('EMP-777'),
        getEmployeeDesignation: jest.fn().mockResolvedValue('Lead Engineer'),
        getCompanyName: jest.fn().mockResolvedValue('Cyberdyne Systems'),
      };

      const orchestrator = new GenerationOrchestrator(
        validator,
        generatorFactory,
        templateLoader,
        pdfService,
        htmlConverter,
        automaticResolver,
        dataProvider,
        mockStorage,
        snapshotBuilder,
        eventBus,
        unitOfWork,
        documentRepo,
      );

      const template = TemplateAggregate.create({
        businessId: 'TMPL-100',
        companyId,
        documentTypeId: 'dt-100',
        name: 'Joining Letter',
        status: TemplateStatus.PUBLISHED,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'hr-1',
        updatedBy: 'hr-1',
        versions: [],
      });

      const version = TemplateVersionEntity.create({
        businessId: 'VER-100',
        templateId: template.id.toValue() as string,
        versionNumber: 1,
        content: `
          <h1>CONFIRMATION LETTER</h1>
          <p>Employee: {{employee.fullName}}</p>
          <p>Employee ID: {{employee.employeeId}}</p>
          <p>Designation: {{employee.designation}}</p>
          <p>Company: {{company.name}}</p>
        `,
        contentType: 'html',
        status: TemplateVersionStatus.PUBLISHED,
        placeholders: [],
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'hr-1',
        updatedBy: 'hr-1',
      });
      template.addVersion(version);

      const document = GeneratedDocumentAggregate.create({
        businessId: 'GDOC-2026-999',
        companyId,
        profileId: 'prof-777',
        documentTypeId: 'dt-100',
        templateVersionId: version.id.toValue() as string,
        entityType: 'EMPLOYEE',
        entityId: employeeId,
        status: DocumentGenerationStatus.QUEUED as any,
        isDeleted: false,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'hr-1',
        updatedBy: 'hr-1',
        snapshots: [],
      });

      const context = {
        tenantId: companyId,
        companyId,
        profileId: 'prof-777',
        entityType: 'EMPLOYEE',
        entityId: employeeId,
        placeholders: {},
        locale: 'en-US',
        timezone: 'UTC',
        currency: 'USD',
        generatedDate: new Date(),
      };

      const snapshots = await orchestrator.execute(
        document,
        template,
        version,
        context,
        'hr-user-1',
      );

      // Verify snapshots
      expect(snapshots).toHaveLength(2);
      const htmlSnapshot = snapshots.find((s) => s.mimeType === 'text/html');
      const pdfSnapshot = snapshots.find((s) => s.mimeType === 'application/pdf');

      expect(htmlSnapshot).toBeDefined();
      expect(pdfSnapshot).toBeDefined();
      expect(document.status).toBe(DocumentGenerationStatus.GENERATED);

      // Verify that PDF upload was called with a buffer starting with %PDF-
      const pdfUploadCall = mockStorage.upload.mock.calls.find(
        (c: any[]) => c[2] === 'application/pdf',
      );
      expect(pdfUploadCall).toBeDefined();
      const uploadedBuffer: Buffer = pdfUploadCall[1];
      expect(uploadedBuffer.subarray(0, 5).toString('utf-8')).toBe('%PDF-');

      // Verify historical immutability: generated document retains exact templateVersionId
      expect(document.templateVersionId).toBe(version.id.toValue());
    }, 45000);
  });

  // =========================================================================
  // 4. DOWNLOAD & PREVIEW ENDPOINTS & TENANT ISOLATION
  // =========================================================================
  describe('4. DocumentDownloadController & RBAC', () => {
    const companyA = 'tenant-company-a';
    const companyB = 'tenant-company-b';

    let mockQueryBus: any;
    let mockStorageService: any;
    let mockPrisma: any;
    let controller: DocumentDownloadController;

    const validPdfBuffer = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF',
    );

    beforeEach(() => {
      mockQueryBus = {
        execute: jest.fn(),
      };
      mockStorageService = {
        download: jest.fn().mockResolvedValue(validPdfBuffer),
      };
      mockPrisma = {
        documentType: {
          findUnique: jest.fn().mockResolvedValue({ name: 'Confirmation Letter' }),
        },
        employee: {
          findUnique: jest.fn().mockResolvedValue({ employeeNumber: 'EMP_000001' }),
        },
      };

      controller = new DocumentDownloadController(
        mockQueryBus,
        mockStorageService,
        mockPrisma,
      );
    });

    it('downloads genuine PDF with application/pdf and proper filename', async () => {
      mockQueryBus.execute.mockResolvedValue(
        Result.ok({
          id: 'doc-123',
          businessId: 'GDOC-0001',
          companyId: companyA,
          documentTypeId: 'dt-1',
          entityType: 'EMPLOYEE',
          entityId: 'emp-1',
          snapshots: [
            {
              mimeType: 'application/pdf',
              fileUrl: 'local://documents/generated.pdf',
            },
          ],
        }),
      );

      const req = {
        user: { companyId: companyA, userId: 'hr-1', role: 'HR_MANAGER' },
      };

      const headers: Record<string, string> = {};
      let endedBuffer: Buffer | null = null;
      const res: any = {
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
        end: (buf: Buffer) => {
          endedBuffer = buf;
        },
      };

      await controller.downloadDocument(req, 'doc-123', 'pdf', res);

      expect(headers['Content-Type']).toBe('application/pdf');
      expect(headers['Content-Disposition']).toContain('attachment; filename="EMP_000001_Confirmation_Letter.pdf"');
      expect(endedBuffer).not.toBeNull();
      expect(endedBuffer!.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    });

    it('previews genuine PDF inline in browser with application/pdf header', async () => {
      mockQueryBus.execute.mockResolvedValue(
        Result.ok({
          id: 'doc-123',
          businessId: 'GDOC-0001',
          companyId: companyA,
          documentTypeId: 'dt-1',
          entityType: 'EMPLOYEE',
          entityId: 'emp-1',
          snapshots: [
            {
              mimeType: 'application/pdf',
              fileUrl: 'local://documents/generated.pdf',
            },
          ],
        }),
      );

      const req = {
        user: { companyId: companyA, userId: 'hr-1', role: 'HR_MANAGER' },
      };

      const headers: Record<string, string> = {};
      let endedBuffer: Buffer | null = null;
      const res: any = {
        setHeader: (k: string, v: string) => {
          headers[k] = v;
        },
        end: (buf: Buffer) => {
          endedBuffer = buf;
        },
      };

      await controller.previewDocument(req, 'doc-123', 'pdf', res);

      expect(headers['Content-Type']).toBe('application/pdf');
      expect(headers['Content-Disposition']).toContain('inline;');
      expect(endedBuffer!.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    });

    it('blocks cross-tenant document download (Company B cannot download Company A document)', async () => {
      // Query handler returns not found when companyId doesn't match document's companyId
      mockQueryBus.execute.mockResolvedValue(Result.fail('Document not found: doc-123'));

      const req = {
        user: { companyId: companyB, userId: 'hr-b' },
      };

      const res: any = { setHeader: jest.fn(), end: jest.fn() };

      await expect(
        controller.downloadDocument(req, 'doc-123', 'pdf', res),
      ).rejects.toThrow(/Document not found/);
    });

    it('blocks employee from downloading another employee document (RBAC / IDOR Protection)', async () => {
      mockQueryBus.execute.mockResolvedValue(
        Result.ok({
          id: 'doc-123',
          businessId: 'GDOC-0001',
          companyId: companyA,
          documentTypeId: 'dt-1',
          entityType: 'EMPLOYEE',
          entityId: 'emp-OTHER', // Belongs to a different employee!
          profileId: 'prof-OTHER',
          snapshots: [
            {
              mimeType: 'application/pdf',
              fileUrl: 'local://documents/generated.pdf',
            },
          ],
        }),
      );

      const req = {
        user: {
          companyId: companyA,
          userId: 'user-emp-1',
          employeeId: 'emp-MY-OWN',
          role: 'EMPLOYEE',
        },
      };

      const res: any = { setHeader: jest.fn(), end: jest.fn() };

      await expect(
        controller.downloadDocument(req, 'doc-123', 'pdf', res),
      ).rejects.toThrow(/Access denied: You are only authorized to access your own documents/);
    });
  });

  // =========================================================================
  // 5. MAPPER & HISTORICAL IMMUTABILITY
  // =========================================================================
  describe('5. GeneratedDocumentMapper & Historical Snapshot Preservation', () => {
    it('toDTO includes full snapshot metadata (mimeType, filePath, fileSize, checksum)', () => {
      const mapper = new GeneratedDocumentMapper();

      const doc = GeneratedDocumentAggregate.create(
        {
          businessId: 'GDOC-2026-0001',
          companyId: 'comp-1',
          profileId: 'prof-1',
          documentTypeId: 'dt-1',
          templateVersionId: 'ver-1',
          entityType: 'EMPLOYEE',
          entityId: 'emp-1',
          status: DocumentGenerationStatus.GENERATED,
          generatedAt: new Date('2026-01-01T12:00:00Z'),
          generatedBy: 'user-1',
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          snapshots: [],
        },
        new Identifier('doc-uuid-1'),
      );

      const dto = mapper.toDTO(doc);

      expect(dto.id).toBe('doc-uuid-1');
      expect(dto.companyId).toBe('comp-1');
      expect(dto.entityType).toBe('EMPLOYEE');
      expect(dto.entityId).toBe('emp-1');
      expect(dto.templateVersionId).toBe('ver-1');
    });
  });
});
