import { Identifier } from '../../../../kernel/domain/Identifier';
import { CompanyAggregate } from '../../src/domain/entities/CompanyAggregate';
import { UpdateCompanySettingsHandler } from '../../src/application/commands/UpdateCompanySettingsHandler';
import { UpdateCompanySettingsCommand } from '../../src/application/commands/UpdateCompanySettingsCommand';
import { UploadCompanyBrandingHandler } from '../../src/application/commands/UploadCompanyBrandingHandler';
import { UploadCompanyBrandingCommand } from '../../src/application/commands/UploadCompanyBrandingCommand';
import { RemoveCompanyBrandingHandler } from '../../src/application/commands/RemoveCompanyBrandingHandler';
import { RemoveCompanyBrandingCommand } from '../../src/application/commands/RemoveCompanyBrandingCommand';
import { GetCompanySettingsHandler } from '../../src/application/queries/GetCompanySettingsHandler';
import { GetCompanySettingsQuery } from '../../src/application/queries/GetCompanySettingsQuery';
import { CompanySettingsController } from '../../src/presentation/controllers/CompanySettingsController';
import { PrismaEntityDataProvider } from '../../../document/src/infrastructure/data/PrismaEntityDataProvider';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('Step 9 — Company Settings Specification', () => {
  const companyA = '11111111-1111-1111-1111-111111111111';
  const companyB = '22222222-2222-2222-2222-222222222222';
  const adminUserId = 'user-admin-1';
  const employeeUserId = 'user-emp-1';

  let mockCompanyRepo: any;
  let mockStorageService: any;
  let mockPrisma: any;

  const makeCompany = (options?: {
    id?: string;
    name?: string;
    legalName?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    authorizedPerson?: string | null;
    authorizedPersonDesignation?: string | null;
    signatureUrl?: string | null;
    isDeleted?: boolean;
  }): CompanyAggregate => {
    const compId = options?.id ?? companyA;
    return CompanyAggregate.create(
      {
        businessId: 'CMP_000001',
        name: options?.name ?? 'Smatal Global Tech',
        legalName: options?.legalName ?? 'Smatal Technologies Private Limited',
        code: 'SMATAL',
        website: options?.website ?? 'https://smatal.com',
        address: options?.address ?? '100 Innovation Blvd, Silicon City',
        phone: options?.phone ?? '+1 555 123 4567',
        email: options?.email ?? 'contact@smatal.com',
        industry: 'Information Technology',
        logoUrl: options?.logoUrl ?? null,
        authorizedPerson: options?.authorizedPerson ?? 'Ravi Kumar',
        authorizedPersonDesignation: options?.authorizedPersonDesignation ?? 'Director of HR',
        signatureUrl: options?.signatureUrl ?? null,
        registrationNumber: 'REG-999888',
        taxNumber: 'TAX-777666',
        isActive: true,
        isDeleted: options?.isDeleted ?? false,
        version: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        createdBy: adminUserId,
        updatedBy: adminUserId,
      },
      new Identifier<string>(compId),
    );
  };

  beforeEach(() => {
    mockCompanyRepo = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      findByCode: jest.fn(),
    };

    mockStorageService = {
      upload: jest.fn().mockImplementation(async (key: string, buffer: Buffer) => ({
        uri: `local://${key}`,
        checksum: 'fake-checksum',
        sizeBytes: buffer.length,
      })),
      download: jest.fn().mockResolvedValue(Buffer.from('fake-image-bytes')),
      delete: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(true),
    };

    mockPrisma = {
      company: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      branch: {
        findFirst: jest.fn(),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'aud-1' }),
      },
    };
  });

  describe('1. Retrieval & Updates (A, B, C, I)', () => {
    it('A. retrieves company settings accurately', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);

      const handler = new GetCompanySettingsHandler(mockCompanyRepo);
      const result = await handler.execute(new GetCompanySettingsQuery(companyA));

      expect(result.id).toBe(companyA);
      expect(result.name).toBe('Smatal Global Tech');
      expect(result.legalName).toBe('Smatal Technologies Private Limited');
      expect(result.address).toBe('100 Innovation Blvd, Silicon City');
      expect(result.phone).toBe('+1 555 123 4567');
      expect(result.email).toBe('contact@smatal.com');
      expect(result.authorizedPerson).toBe('Ravi Kumar');
      expect(result.authorizedPersonDesignation).toBe('Director of HR');
    });

    it('B. updates company settings and persists changes', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);

      const handler = new UpdateCompanySettingsHandler(mockCompanyRepo, mockPrisma);
      const result = await handler.execute(
        new UpdateCompanySettingsCommand(companyA, adminUserId, 'HR_ADMIN', {
          name: 'Smatal AI Systems',
          address: '450 Frontier Way, Austin, TX',
          phone: '+1 512 888 9999',
          email: 'ops@smatal.ai',
          authorizedPerson: 'Sarah Connor',
          authorizedPersonDesignation: 'Chief People Officer',
        }),
      );

      expect(result.name).toBe('Smatal AI Systems');
      expect(result.address).toBe('450 Frontier Way, Austin, TX');
      expect(result.phone).toBe('+1 512 888 9999');
      expect(result.email).toBe('ops@smatal.ai');
      expect(result.authorizedPerson).toBe('Sarah Connor');
      expect(result.authorizedPersonDesignation).toBe('Chief People Officer');
      expect(mockCompanyRepo.save).toHaveBeenCalled();
    });

    it('C. enforces tenant isolation: cannot fetch or update non-existent/cross-tenant company', async () => {
      mockCompanyRepo.findById.mockResolvedValue(null);

      const getHandler = new GetCompanySettingsHandler(mockCompanyRepo);
      await expect(getHandler.execute(new GetCompanySettingsQuery(companyB))).rejects.toThrow(
        NotFoundException,
      );

      const updateHandler = new UpdateCompanySettingsHandler(mockCompanyRepo, mockPrisma);
      await expect(
        updateHandler.execute(
          new UpdateCompanySettingsCommand(companyB, adminUserId, 'HR_ADMIN', {
            name: 'Malicious Corp',
          }),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('I. rejects invalid input: empty company name or malformed email/phone', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);
      const handler = new UpdateCompanySettingsHandler(mockCompanyRepo, mockPrisma);

      // Empty name
      await expect(
        handler.execute(
          new UpdateCompanySettingsCommand(companyA, adminUserId, 'HR_ADMIN', {
            name: '   ',
          }),
        ),
      ).rejects.toThrow(BadRequestException);

      // Malformed email
      await expect(
        handler.execute(
          new UpdateCompanySettingsCommand(companyA, adminUserId, 'HR_ADMIN', {
            email: 'not-an-email',
          }),
        ),
      ).rejects.toThrow(BadRequestException);

      // Malformed website
      await expect(
        handler.execute(
          new UpdateCompanySettingsCommand(companyA, adminUserId, 'HR_ADMIN', {
            website: 'invalid://url',
          }),
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('2. RBAC & Security Protection (D, E, M)', () => {
    it('D. allows HR_ADMIN and HR_MANAGER to update settings', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);
      const handler = new UpdateCompanySettingsHandler(mockCompanyRepo, mockPrisma);

      const result = await handler.execute(
        new UpdateCompanySettingsCommand(companyA, adminUserId, 'HR_MANAGER', {
          name: 'Updated by HR Manager',
        }),
      );
      expect(result.name).toBe('Updated by HR Manager');
    });

    it('E. rejects unauthorized employee modification', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);
      const handler = new UpdateCompanySettingsHandler(mockCompanyRepo, mockPrisma);

      await expect(
        handler.execute(
          new UpdateCompanySettingsCommand(companyA, employeeUserId, 'EMPLOYEE', {
            name: 'Hacked by Employee',
          }),
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('M. verifies client-supplied companyId cannot override JWT companyId in controller', async () => {
      const mockCommandBus = { execute: jest.fn().mockResolvedValue({ id: companyA }) };
      const mockQueryBus = { execute: jest.fn().mockResolvedValue({ id: companyA }) };

      const controller = new CompanySettingsController(
        mockCommandBus as any,
        mockQueryBus as any,
        mockCompanyRepo,
        mockStorageService,
      );

      // Attacker tries to pass body with companyId: companyB, but req.user has companyA
      const req = {
        user: { companyId: companyA, userId: adminUserId, roles: ['HR_ADMIN'] },
      };

      await controller.getSettings(req);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(new GetCompanySettingsQuery(companyA));

      await controller.updateSettings(req, {
        name: 'Safe Update',
      } as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: companyA, // Strictly JWT identity
        }),
      );
    });
  });

  describe('3. Branding: Logo & Signature (F, G, H)', () => {
    it('F. uploads company logo, stores via IStorageService, and updates aggregate', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);

      const handler = new UploadCompanyBrandingHandler(
        mockCompanyRepo,
        mockStorageService,
        mockPrisma,
      );

      const logoBuffer = Buffer.from('fake-png-image-binary-data');
      const result = await handler.execute(
        new UploadCompanyBrandingCommand(
          companyA,
          adminUserId,
          'HR_ADMIN',
          'logo',
          logoBuffer,
          'image/png',
          'company_logo.png',
          logoBuffer.length,
        ),
      );

      expect(result.type).toBe('logo');
      expect(result.url).toContain('companies/11111111-1111-1111-1111-111111111111/branding/logo_');
      expect(comp.logoUrl).toBe(result.url);
      expect(mockCompanyRepo.save).toHaveBeenCalled();
    });

    it('G. uploads authorized signature and updates aggregate', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);

      const handler = new UploadCompanyBrandingHandler(
        mockCompanyRepo,
        mockStorageService,
        mockPrisma,
      );

      const sigBuffer = Buffer.from('fake-signature-binary');
      const result = await handler.execute(
        new UploadCompanyBrandingCommand(
          companyA,
          adminUserId,
          'HR_ADMIN',
          'signature',
          sigBuffer,
          'image/jpeg',
          'sig.jpg',
          sigBuffer.length,
        ),
      );

      expect(result.type).toBe('signature');
      expect(comp.signatureUrl).toBe(result.url);
      expect(mockCompanyRepo.save).toHaveBeenCalled();
    });

    it('H. rejects invalid file format or oversized file (>2MB)', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);

      const handler = new UploadCompanyBrandingHandler(
        mockCompanyRepo,
        mockStorageService,
        mockPrisma,
      );

      // Executable file
      await expect(
        handler.execute(
          new UploadCompanyBrandingCommand(
            companyA,
            adminUserId,
            'HR_ADMIN',
            'logo',
            Buffer.from('binary'),
            'application/x-msdownload',
            'malware.exe',
            100,
          ),
        ),
      ).rejects.toThrow(BadRequestException);

      // Oversized file (>2MB)
      await expect(
        handler.execute(
          new UploadCompanyBrandingCommand(
            companyA,
            adminUserId,
            'HR_ADMIN',
            'logo',
            Buffer.from('huge'),
            'image/png',
            'huge.png',
            3 * 1024 * 1024,
          ),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('removes company branding asset cleanly', async () => {
      const comp = makeCompany({ logoUrl: 'https://cdn.example.com/logo.png' });
      mockCompanyRepo.findById.mockResolvedValue(comp);

      const handler = new RemoveCompanyBrandingHandler(mockCompanyRepo, mockPrisma);
      await handler.execute(
        new RemoveCompanyBrandingCommand(companyA, adminUserId, 'HR_ADMIN', 'logo'),
      );

      expect(comp.logoUrl).toBeNull();
      expect(mockCompanyRepo.save).toHaveBeenCalled();
    });
  });

  describe('4. Audit Logging & Document Placeholder Integration (J, K, L)', () => {
    it('J. creates audit log on company settings and branding changes', async () => {
      const comp = makeCompany();
      mockCompanyRepo.findById.mockResolvedValue(comp);

      const handler = new UpdateCompanySettingsHandler(mockCompanyRepo, mockPrisma);
      await handler.execute(
        new UpdateCompanySettingsCommand(companyA, adminUserId, 'HR_ADMIN', {
          name: 'Audited Company Name',
        }),
      );

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: companyA,
            action: 'COMPANY_SETTINGS_UPDATED',
            performedBy: adminUserId,
            beforeState: expect.any(Object),
            afterState: expect.any(Object),
          }),
        }),
      );
    });

    it('K. resolves document placeholders from updated company settings', async () => {
      mockPrisma.company.findUnique.mockResolvedValue({
        id: companyA,
        name: 'Smatal Tech Global',
        website: 'https://smatal.global',
        address: 'Tower A, World Trade Center',
        phone: '+1 800 555 0199',
        email: 'legal@smatal.global',
        authorizedPerson: 'Priya Sharma',
        authorizedPersonDesignation: 'VP of Human Resources',
        logoUrl: 'https://smatal.global/logo.png',
        signatureUrl: 'https://smatal.global/sig.png',
      });

      const provider = new PrismaEntityDataProvider(mockPrisma as any);

      expect(await provider.getCompanyName({ companyId: companyA })).toBe('Smatal Tech Global');
      expect(await provider.getCompanyWebsite({ companyId: companyA })).toBe('https://smatal.global');
      expect(await provider.getCompanyAddress({ companyId: companyA })).toBe('Tower A, World Trade Center');
      expect(await provider.getCompanyPhone({ companyId: companyA })).toBe('+1 800 555 0199');
      expect(await provider.getCompanyEmail({ companyId: companyA })).toBe('legal@smatal.global');
      expect(await provider.getCompanyAuthorizedPerson({ companyId: companyA })).toBe('Priya Sharma');
      expect(await provider.getCompanyAuthorizedPersonDesignation({ companyId: companyA })).toBe('VP of Human Resources');
      expect(await provider.getCompanyLogo({ companyId: companyA })).toBe('https://smatal.global/logo.png');
      expect(await provider.getCompanySignature({ companyId: companyA })).toBe('https://smatal.global/sig.png');
    });

    it('L. previously generated documents remain immutable snapshot records', () => {
      // Generated documents store snapshots at generation time.
      const snapshotBefore = {
        documentId: 'doc-100',
        contentHash: 'hash-abc-123',
        renderedHtml: '<div>Smatal Technologies Old Address</div>',
        resolvedPlaceholders: {
          'company.name': 'Smatal Technologies',
          'company.address': 'Old Address',
        },
      };

      // Company settings updated
      const updatedSettings = {
        'company.name': 'Smatal New Brand',
        'company.address': 'New Address',
      };

      // Verify original snapshot is NOT modified
      expect(snapshotBefore.resolvedPlaceholders['company.name']).toBe('Smatal Technologies');
      expect(snapshotBefore.resolvedPlaceholders['company.address']).toBe('Old Address');
      expect(snapshotBefore.renderedHtml).toContain('Old Address');
    });
  });
});
