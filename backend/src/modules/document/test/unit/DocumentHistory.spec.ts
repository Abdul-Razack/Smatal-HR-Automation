import { DocumentDownloadController } from '../../src/presentation/controllers/DocumentDownloadController';
import { GeneratedDocumentController } from '../../src/presentation/controllers/GeneratedDocumentController';
import { GeneratedDocumentMapper } from '../../src/infrastructure/mappers/GeneratedDocumentMapper';
import { GeneratedDocumentAggregate } from '../../src/domain/aggregates/GeneratedDocumentAggregate';
import { DocumentSnapshotVO } from '../../src/domain/value-objects/DocumentSnapshotVO';
import { DocumentGenerationStatus } from '../../src/domain/enums/DocumentEnums';
import { Identifier } from '../../../../kernel/domain/Identifier';
import { Result } from '../../../../kernel/result/Result';
import { ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaGeneratedDocumentRepository } from '../../src/infrastructure/repositories/PrismaGeneratedDocumentRepository';
import { GetAllGeneratedDocumentsHandler } from '../../src/application/queries/GetAllGeneratedDocuments/GetAllGeneratedDocumentsHandler';
import { GetAllGeneratedDocumentsQuery } from '../../src/application/queries/GetAllGeneratedDocuments/GetAllGeneratedDocumentsQuery';

describe('Step 11 — Document History & Versioning UI Specification', () => {
  const tenantACompanyId = '11111111-1111-1111-1111-111111111111';
  const tenantBCompanyId = '22222222-2222-2222-2222-222222222222';
  const employee1Id = '33333333-3333-3333-3333-333333333333';
  const employee2Id = '44444444-4444-4444-4444-444444444444';
  const docTypeAppointmentId = '55555555-5555-5555-5555-555555555555';
  const docTypeConfirmationId = '66666666-6666-6666-6666-666666666666';

  let mapper: GeneratedDocumentMapper;
  let mockStorageService: any;
  let mockPrismaService: any;
  let mockQueryBus: any;
  let mockCommandBus: any;
  let downloadController: DocumentDownloadController;
  let generatedDocumentController: GeneratedDocumentController;

  const createSampleDoc = (overrides?: Partial<any>): GeneratedDocumentAggregate => {
    return GeneratedDocumentAggregate.create(
      {
        businessId: overrides?.businessId || 'GDOC-2026-0001',
        companyId: overrides?.companyId || tenantACompanyId,
        profileId: overrides?.profileId || 'prof-1',
        documentTypeId: overrides?.documentTypeId || docTypeAppointmentId,
        templateVersionId: overrides?.templateVersionId || 'tmpl-ver-1',
        entityType: overrides?.entityType || 'EMPLOYEE',
        entityId: overrides?.entityId || employee1Id,
        status: overrides?.status || DocumentGenerationStatus.GENERATED,
        generatedAt: overrides?.generatedAt || new Date('2026-08-01T10:00:00Z'),
        generatedBy: overrides?.generatedBy || 'HR Admin',
        isDeleted: false,
        version: overrides?.version || 1,
        createdAt: overrides?.createdAt || new Date('2026-08-01T10:00:00Z'),
        updatedAt: overrides?.updatedAt || new Date('2026-08-01T10:00:00Z'),
        createdBy: 'user-1',
        updatedBy: 'user-1',
        snapshots: [
          DocumentSnapshotVO.create({
            id: 'snap-1',
            generatedDocumentId: 'gdoc-1',
            filePath: '/storage/docs/doc1.pdf',
            fileUrl: 'https://storage.smatal.com/docs/doc1.pdf',
            fileSize: 2048,
            mimeType: 'application/pdf',
            checksum: 'sha256-mock-hash-1',
            storageProvider: 'local',
            createdAt: new Date('2026-08-01T10:00:00Z'),
            createdBy: 'user-1',
          }),
        ],
        documentTypeName: overrides?.documentTypeName || 'Appointment Letter',
        documentTypeCode: overrides?.documentTypeCode || 'APPOINTMENT',
        templateName: overrides?.templateName || 'Standard Appointment Letter',
        templateVersionNumber: overrides?.templateVersionNumber || 1,
        employeeName: overrides?.employeeName || 'John Doe',
        employeeNumber: overrides?.employeeNumber || 'EMP_000123',
        companyName: overrides?.companyName || 'Acme Corp',
      },
      new Identifier<string>(overrides?.id || 'gdoc-uuid-1'),
    );
  };

  beforeEach(() => {
    mapper = new GeneratedDocumentMapper();

    mockStorageService = {
      download: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 Mock Real PDF Content bytes')),
      upload: jest.fn().mockResolvedValue('https://storage.smatal.com/docs/new.pdf'),
    };

    mockPrismaService = {
      generatedDocument: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      documentType: {
        findUnique: jest.fn().mockResolvedValue({ name: 'Appointment Letter' }),
      },
      employee: {
        findUnique: jest.fn().mockResolvedValue({
          id: employee1Id,
          employeeNumber: 'EMP_000123',
          businessId: 'EMP_000123',
        }),
      },
    };

    mockQueryBus = {
      execute: jest.fn(),
    };

    mockCommandBus = {
      execute: jest.fn(),
    };

    downloadController = new DocumentDownloadController(
      mockQueryBus as any,
      mockStorageService,
      mockPrismaService,
    );

    generatedDocumentController = new GeneratedDocumentController(
      mockCommandBus as any,
      mockQueryBus as any,
      mockStorageService,
      mockPrismaService,
    );
  });

  // =========================================================================
  // A & B: Authentication & Authorization
  // =========================================================================
  describe('A & B. Authentication and Access Control', () => {
    it('A. Authenticated user can access document history', async () => {
      const sampleDoc = createSampleDoc();
      const dto = mapper.toDTO(sampleDoc);

      mockQueryBus.execute.mockResolvedValue(Result.ok([dto]));

      const req = {
        user: { userId: 'admin-1', companyId: tenantACompanyId, role: 'HR_MANAGER' },
      };

      const result = await downloadController.getGeneratedDocuments(req as any, {});
      expect(result.data!.items.length).toBe(1);
      expect(result.data!.items[0].businessId).toBe('GDOC-2026-0001');
    });

    it('B. Unauthenticated request without JWT companyId throws or rejects', async () => {
      mockQueryBus.execute.mockResolvedValue(Result.fail('Company ID is required'));

      const req = { user: {} }; // Missing companyId

      await expect(
        downloadController.getGeneratedDocuments(req as any, {}),
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // C & D: Multi-Tenant Isolation
  // =========================================================================
  describe('C & D. Strict Multi-Tenant Isolation', () => {
    it('C. Tenant A cannot access Tenant B document history', async () => {
      // Setup query mock that checks companyId strictly
      mockQueryBus.execute.mockImplementation((query: GetAllGeneratedDocumentsQuery) => {
        if (query.companyId === tenantBCompanyId) {
          return Promise.resolve(Result.ok([mapper.toDTO(createSampleDoc({ companyId: tenantBCompanyId }))]));
        }
        return Promise.resolve(Result.ok([])); // Tenant A has 0 docs in this case
      });

      const reqTenantA = {
        user: { userId: 'user-tenant-a', companyId: tenantACompanyId, role: 'HR_MANAGER' },
      };

      const resultA = await downloadController.getGeneratedDocuments(reqTenantA as any, {});
      expect(resultA.data!.items.length).toBe(0);
    });

    it('D. Client-supplied companyId query parameter cannot override JWT companyId', async () => {
      let queriedCompanyId = '';
      mockQueryBus.execute.mockImplementation((query: GetAllGeneratedDocumentsQuery) => {
        queriedCompanyId = query.companyId;
        return Promise.resolve(Result.ok([]));
      });

      const req = {
        user: { userId: 'user-1', companyId: tenantACompanyId, role: 'HR_MANAGER' },
      };

      // Attacker passes companyId in query param
      const attackerQuery: any = { companyId: tenantBCompanyId };

      await downloadController.getGeneratedDocuments(req as any, attackerQuery);

      // Must strictly use req.user.companyId from JWT
      expect(queriedCompanyId).toBe(tenantACompanyId);
      expect(queriedCompanyId).not.toBe(tenantBCompanyId);
    });
  });

  // =========================================================================
  // E & F: RBAC & IDOR Protection
  // =========================================================================
  describe('E & F. RBAC and IDOR Protection', () => {
    it('E. Employee can only access permitted own documents (IDOR protection)', async () => {
      const otherEmployeeDoc = mapper.toDTO(
        createSampleDoc({
          entityId: employee2Id,
          profileId: 'prof-other',
        }),
      );

      mockQueryBus.execute.mockResolvedValue(Result.ok(otherEmployeeDoc));

      const employeeReq = {
        user: {
          userId: 'user-emp-1',
          companyId: tenantACompanyId,
          role: 'EMPLOYEE',
          employeeId: employee1Id,
          profileId: 'prof-1',
        },
      };

      // Employee 1 attempts to download Employee 2's document
      const mockRes: any = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await expect(
        downloadController.serveDocumentFile(
          employeeReq,
          otherEmployeeDoc.id,
          'pdf',
          'attachment',
          mockRes,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('F. HR/Admin can access documents within their tenant regardless of target employee', async () => {
      const anyEmployeeDoc = mapper.toDTO(
        createSampleDoc({
          entityId: employee2Id,
          companyId: tenantACompanyId,
        }),
      );

      mockQueryBus.execute.mockResolvedValue(Result.ok(anyEmployeeDoc));

      const hrReq = {
        user: {
          userId: 'hr-1',
          companyId: tenantACompanyId,
          role: 'HR_MANAGER',
        },
      };

      const mockRes: any = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await downloadController.serveDocumentFile(
        hrReq,
        anyEmployeeDoc.id,
        'pdf',
        'attachment',
        mockRes,
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // G, H, I, J, K: Provenance Verification
  // =========================================================================
  describe('G, H, I, J, K. Document Provenance & Immutability Linking', () => {
    it('G. Document history returns correct employee details', () => {
      const doc = createSampleDoc({
        employeeName: 'Alice Smith',
        employeeNumber: 'EMP_000087',
      });
      const dto = mapper.toDTO(doc);

      expect(dto.employeeName).toBe('Alice Smith');
      expect(dto.employeeNumber).toBe('EMP_000087');
    });

    it('H. Document type name and code are correctly mapped', () => {
      const doc = createSampleDoc({
        documentTypeName: 'Relieving Letter',
        documentTypeCode: 'RELIEVING',
      });
      const dto = mapper.toDTO(doc);

      expect(dto.documentTypeName).toBe('Relieving Letter');
      expect(dto.documentTypeCode).toBe('RELIEVING');
    });

    it('I. Template name is correctly captured', () => {
      const doc = createSampleDoc({
        templateName: 'Official Relieving Certificate',
      });
      const dto = mapper.toDTO(doc);

      expect(dto.templateName).toBe('Official Relieving Certificate');
    });

    it('J. Template version number is preserved as v1, v2, etc.', () => {
      const docV3 = createSampleDoc({
        templateVersionNumber: 3,
      });
      const dto = mapper.toDTO(docV3);

      expect(dto.templateVersionNumber).toBe(3);
    });

    it('K. Historical version remains linked to its original template version ID', () => {
      const historicalDoc = createSampleDoc({
        templateVersionId: 'old-version-uuid-v1',
        templateVersionNumber: 1,
      });
      const dto = mapper.toDTO(historicalDoc);

      expect(dto.templateVersionId).toBe('old-version-uuid-v1');
      expect(dto.templateVersionNumber).toBe(1);
    });
  });

  // =========================================================================
  // L, M, N: Immutability and Real PDF Serving
  // =========================================================================
  describe('L, M, N. Historical Immutability & Stored PDF Serving', () => {
    it('L. Historical document has no update endpoint to mutate stored content', () => {
      // GeneratedDocumentAggregate has no updateContent or modifySnapshot method
      const doc = createSampleDoc();
      expect((doc as any).updateContent).toBeUndefined();
      expect((doc as any).changeTemplateVersion).toBeUndefined();
      expect((doc as any).replaceSnapshot).toBeUndefined();
    });

    it('M. View uses stored PDF rather than re-rendering or regenerating', async () => {
      const doc = mapper.toDTO(createSampleDoc());
      mockQueryBus.execute.mockResolvedValue(Result.ok(doc));

      const hrReq = {
        user: { companyId: tenantACompanyId, role: 'HR_MANAGER' },
      };
      const mockRes: any = {
        setHeader: jest.fn(),
        end: jest.fn(),
      };

      await downloadController.serveDocumentFile(
        hrReq,
        doc.id,
        'pdf',
        'inline',
        mockRes,
      );

      // Verify that storageService.download was called with the stored snapshot fileUrl
      expect(mockStorageService.download).toHaveBeenCalledWith(
        'https://storage.smatal.com/docs/doc1.pdf',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('inline; filename='),
      );
    });

    it('N. Download returns valid PDF bytes beginning with %PDF-', async () => {
      const doc = mapper.toDTO(createSampleDoc());
      mockQueryBus.execute.mockResolvedValue(Result.ok(doc));

      const hrReq = {
        user: { companyId: tenantACompanyId, role: 'HR_MANAGER' },
      };
      let returnedBuffer: Buffer | null = null;
      const mockRes: any = {
        setHeader: jest.fn(),
        end: jest.fn().mockImplementation((buf: Buffer) => {
          returnedBuffer = buf;
        }),
      };

      await downloadController.serveDocumentFile(
        hrReq,
        doc.id,
        'pdf',
        'attachment',
        mockRes,
      );

      expect(returnedBuffer).not.toBeNull();
      expect(returnedBuffer!.subarray(0, 5).toString('utf-8')).toBe('%PDF-');
    });

    it('N. Throws error if stored PDF file does not begin with %PDF-', async () => {
      const corruptedDoc = mapper.toDTO(createSampleDoc());
      mockQueryBus.execute.mockResolvedValue(Result.ok(corruptedDoc));

      mockStorageService.download.mockResolvedValueOnce(
        Buffer.from('corrupted binary data not a pdf'),
      );

      const hrReq = {
        user: { companyId: tenantACompanyId, role: 'HR_MANAGER' },
      };
      const mockRes: any = { setHeader: jest.fn(), end: jest.fn() };

      await expect(
        downloadController.serveDocumentFile(
          hrReq,
          corruptedDoc.id,
          'pdf',
          'attachment',
          mockRes,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // =========================================================================
  // O: Multiple Generated Versions Appear as Separate Immutable History Entries
  // =========================================================================
  describe('O. Multiple Generated Versions as Separate Immutable Entries', () => {
    it('O. Chronological version history contains distinct GeneratedDocument records', async () => {
      const docV1 = createSampleDoc({
        id: 'gdoc-uuid-v1',
        businessId: 'GDOC-2026-0001',
        templateVersionNumber: 1,
        generatedAt: new Date('2026-08-01T10:00:00Z'),
      });

      const docV2 = createSampleDoc({
        id: 'gdoc-uuid-v2',
        businessId: 'GDOC-2026-0005',
        templateVersionNumber: 2,
        generatedAt: new Date('2026-08-15T10:00:00Z'),
      });

      const docV3 = createSampleDoc({
        id: 'gdoc-uuid-v3',
        businessId: 'GDOC-2026-0012',
        templateVersionNumber: 3,
        generatedAt: new Date('2026-09-24T10:00:00Z'),
      });

      const list = [docV3, docV2, docV1].map((d) => mapper.toDTO(d));

      expect(list.length).toBe(3);
      expect(list[0].templateVersionNumber).toBe(3);
      expect(list[1].templateVersionNumber).toBe(2);
      expect(list[2].templateVersionNumber).toBe(1);

      // Verify each has distinct businessId and distinct aggregate ID
      expect(list[0].id).not.toBe(list[1].id);
      expect(list[0].businessId).not.toBe(list[1].businessId);
    });
  });

  // =========================================================================
  // P, Q, R, S: Filtering, Empty States, and Pagination
  // =========================================================================
  describe('P, Q, R, S. Filtering, Empty States & Bounded Loading', () => {
    let repo: PrismaGeneratedDocumentRepository;

    beforeEach(() => {
      repo = new PrismaGeneratedDocumentRepository(mockPrismaService, mapper);
    });

    it('P. Search and filters are tenant-scoped in Prisma repository query', async () => {
      mockPrismaService.generatedDocument.findMany.mockResolvedValue([]);

      await repo.findAll(tenantACompanyId, {
        search: 'EMP_000123',
        documentTypeId: docTypeAppointmentId,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      });

      const calledArgs = mockPrismaService.generatedDocument.findMany.mock.calls[0][0];
      expect(calledArgs.where.companyId).toBe(tenantACompanyId);
      expect(calledArgs.where.documentTypeId).toBe(docTypeAppointmentId);
      expect(calledArgs.where.createdAt.gte).toEqual(new Date('2026-01-01'));
      expect(calledArgs.where.createdAt.lte).toEqual(new Date('2026-12-31'));
      expect(calledArgs.take).toBeLessThanOrEqual(200);
    });

    it('Q. Empty employee document history returns empty array cleanly', async () => {
      mockPrismaService.generatedDocument.findMany.mockResolvedValue([]);

      const docs = await repo.findAll(tenantACompanyId, {
        employeeId: 'empty-employee-id',
      });

      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });

    it('R. Empty global document history returns empty array cleanly', async () => {
      mockPrismaService.generatedDocument.findMany.mockResolvedValue([]);

      const docs = await repo.findAll(tenantACompanyId);

      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBe(0);
    });

    it('S. Safe bounded loading caps take limit to maximum 200 items', async () => {
      mockPrismaService.generatedDocument.findMany.mockResolvedValue([]);

      await repo.findAll(tenantACompanyId, {
        limit: 1000, // Client tries to request 1000 records
        offset: 10,
      });

      const calledArgs = mockPrismaService.generatedDocument.findMany.mock.calls[0][0];
      expect(calledArgs.take).toBe(200); // Capped at safe upper bound 200
      expect(calledArgs.skip).toBe(10);
    });
  });
});
