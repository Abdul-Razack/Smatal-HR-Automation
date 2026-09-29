import { STANDARD_HR_DOCUMENT_TYPES } from '../../src/domain/constants/StandardDocumentTypes';
import { DocumentTypeAggregate } from '../../src/domain/aggregates/DocumentTypeAggregate';
import { Identifier } from '../../../../kernel/domain/Identifier';
import { CreateDocumentTypeHandler } from '../../src/application/commands/CreateDocumentType/CreateDocumentTypeHandler';
import { CreateDocumentTypeCommand } from '../../src/application/commands/CreateDocumentType/CreateDocumentTypeCommand';
import { UpdateDocumentTypeHandler } from '../../src/application/commands/UpdateDocumentType/UpdateDocumentTypeHandler';
import { UpdateDocumentTypeCommand } from '../../src/application/commands/UpdateDocumentType/UpdateDocumentTypeCommand';
import { UpdateDocumentTypeStatusHandler } from '../../src/application/commands/UpdateDocumentTypeStatus/UpdateDocumentTypeStatusHandler';
import { UpdateDocumentTypeStatusCommand } from '../../src/application/commands/UpdateDocumentTypeStatus/UpdateDocumentTypeStatusCommand';
import { ListDocumentTypesHandler } from '../../src/application/queries/ListDocumentTypes/ListDocumentTypesHandler';
import { ListDocumentTypesQuery } from '../../src/application/queries/ListDocumentTypes/ListDocumentTypesQuery';
import { GetDocumentTypeHandler } from '../../src/application/queries/GetDocumentType/GetDocumentTypeHandler';
import { GetDocumentTypeQuery } from '../../src/application/queries/GetDocumentType/GetDocumentTypeQuery';
import { GenerateDocumentHandler } from '../../src/application/commands/GenerateDocument/GenerateDocumentHandler';
import { GenerateDocumentCommand } from '../../src/application/commands/GenerateDocument/GenerateDocumentCommand';
import { IDocumentTypeRepository } from '../../src/domain/repositories/IDocumentTypeRepository';

describe('Step 5 — HR Document Types Specification', () => {
  const REQUIRED_11_CODES = [
    'OFFER_LETTER',
    'APPOINTMENT_LETTER',
    'JOINING_LETTER',
    'CONFIRMATION_LETTER',
    'PROMOTION_LETTER',
    'SALARY_REVISION_LETTER',
    'NOC',
    'RESIGNATION_ACCEPTANCE',
    'RELIEVING_LETTER',
    'EXPERIENCE_CERTIFICATE',
    'SERVICE_CERTIFICATE',
  ];

  describe('1. Standard Document Types Definition', () => {
    it('should define all 11 required standard document types', () => {
      const definedCodes = STANDARD_HR_DOCUMENT_TYPES.map((dt) => dt.code);
      expect(definedCodes).toHaveLength(11);

      for (const requiredCode of REQUIRED_11_CODES) {
        expect(definedCodes).toContain(requiredCode);
      }
    });

    it('each standard type should have a valid name and concise HR description', () => {
      for (const dt of STANDARD_HR_DOCUMENT_TYPES) {
        expect(dt.name).toBeTruthy();
        expect(dt.description).toBeTruthy();
        expect(dt.description.length).toBeGreaterThan(10);
      }
    });

    it('should map lifecycle stages accurately', () => {
      const offer = STANDARD_HR_DOCUMENT_TYPES.find((dt) => dt.code === 'OFFER_LETTER');
      const appointment = STANDARD_HR_DOCUMENT_TYPES.find((dt) => dt.code === 'APPOINTMENT_LETTER');
      const confirmation = STANDARD_HR_DOCUMENT_TYPES.find((dt) => dt.code === 'CONFIRMATION_LETTER');
      const resignation = STANDARD_HR_DOCUMENT_TYPES.find((dt) => dt.code === 'RESIGNATION_ACCEPTANCE');
      const relieving = STANDARD_HR_DOCUMENT_TYPES.find((dt) => dt.code === 'RELIEVING_LETTER');

      expect(offer?.lifecycleStage).toBe('OFFER');
      expect(appointment?.lifecycleStage).toBe('JOINED');
      expect(confirmation?.lifecycleStage).toBe('CONFIRMED');
      expect(resignation?.lifecycleStage).toBe('NOTICE_PERIOD');
      expect(relieving?.lifecycleStage).toBe('RELIEVED');
    });
  });

  describe('2. DocumentType Aggregate Root', () => {
    const createAggregate = (overrides?: Partial<any>) => {
      return DocumentTypeAggregate.create(
        {
          businessId: 'DCT-001',
          companyId: 'company-a',
          name: 'Offer Letter',
          code: 'OFFER_LETTER',
          description: 'Initial employment offer',
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
          ...overrides,
        },
        new Identifier<string>('dt-1'),
      );
    };

    it('should create an active aggregate by default', () => {
      const dt = createAggregate();
      expect(dt.name).toBe('Offer Letter');
      expect(dt.code).toBe('OFFER_LETTER');
      expect(dt.isActive).toBe(true);
      expect(dt.isDeleted).toBe(false);
    });

    it('should deactivate and activate with audit tracking', () => {
      const dt = createAggregate();

      dt.deactivate('user-admin');
      expect(dt.isActive).toBe(false);
      expect(dt.updatedBy).toBe('user-admin');

      dt.activate('user-hr');
      expect(dt.isActive).toBe(true);
      expect(dt.updatedBy).toBe('user-hr');
    });

    it('should update name, description, and bump version', () => {
      const dt = createAggregate();
      const initialVersion = dt.version;

      dt.updateDetails('Official Offer Letter', 'Updated offer description', 'user-admin');
      expect(dt.name).toBe('Official Offer Letter');
      expect(dt.description).toBe('Updated offer description');
      expect(dt.version).toBe(initialVersion + 1);
      expect(dt.updatedBy).toBe('user-admin');
    });
  });

  describe('3. CreateDocumentTypeHandler Validation & Tenant Scoping', () => {
    let mockRepo: jest.Mocked<IDocumentTypeRepository>;
    let mockUow: any;
    let mockIdGen: any;
    let handler: CreateDocumentTypeHandler;
    let storedTypes: DocumentTypeAggregate[];

    beforeEach(() => {
      storedTypes = [];
      mockRepo = {
        findById: jest.fn(async (id: string) => storedTypes.find((t) => t.id.toValue() === id) || null),
        findByBusinessId: jest.fn(async (bId: string) => storedTypes.find((t) => t.businessId === bId) || null),
        findByCode: jest.fn(async (companyId: string, code: string) =>
          storedTypes.find((t) => t.companyId === companyId && t.code === code) || null),
        save: jest.fn(async (dt: DocumentTypeAggregate) => {
          const idx = storedTypes.findIndex((t) => t.id.toValue() === dt.id.toValue());
          if (idx >= 0) storedTypes[idx] = dt;
          else storedTypes.push(dt);
        }),
      };
      mockUow = { withTransaction: jest.fn(async (fn: () => any) => fn()) };
      mockIdGen = { generate: jest.fn(async () => 'DOC-001') };

      handler = new CreateDocumentTypeHandler(mockRepo, mockUow, mockIdGen);
    });

    it('should reject creation when name is empty', async () => {
      const result = await handler.execute(
        new CreateDocumentTypeCommand('company-a', '', 'OFFER_LETTER', 'Desc', 'user-1'),
      );
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Document type name is required');
    });

    it('should reject creation when code is empty', async () => {
      const result = await handler.execute(
        new CreateDocumentTypeCommand('company-a', 'Offer Letter', '   ', 'Desc', 'user-1'),
      );
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Document type code is required');
    });

    it('should create document type and normalize code to uppercase snake_case', async () => {
      const result = await handler.execute(
        new CreateDocumentTypeCommand('company-a', 'Internship Letter', 'internship letter', 'Desc', 'user-1'),
      );
      expect(result.isSuccess).toBe(true);
      expect(storedTypes).toHaveLength(1);
      expect(storedTypes[0].code).toBe('INTERNSHIP_LETTER');
      expect(storedTypes[0].companyId).toBe('company-a');
    });

    it('should reject duplicate code within the same company', async () => {
      await handler.execute(
        new CreateDocumentTypeCommand('company-a', 'Offer Letter', 'OFFER_LETTER', 'Desc', 'user-1'),
      );

      const duplicateResult = await handler.execute(
        new CreateDocumentTypeCommand('company-a', 'Duplicate Offer', 'OFFER_LETTER', 'Desc', 'user-2'),
      );
      expect(duplicateResult.isFailure).toBe(true);
      expect(duplicateResult.errorValue).toContain('already exists in this company');
    });

    it('should allow identical code in a different company (strict tenant isolation)', async () => {
      const resultCompanyA = await handler.execute(
        new CreateDocumentTypeCommand('company-a', 'Offer Letter', 'OFFER_LETTER', 'Desc', 'user-1'),
      );
      expect(resultCompanyA.isSuccess).toBe(true);

      const resultCompanyB = await handler.execute(
        new CreateDocumentTypeCommand('company-b', 'Offer Letter', 'OFFER_LETTER', 'Desc', 'user-2'),
      );
      expect(resultCompanyB.isSuccess).toBe(true);
      expect(storedTypes).toHaveLength(2);
    });
  });

  describe('4. Update and Status Management', () => {
    let mockRepo: jest.Mocked<IDocumentTypeRepository>;
    let mockUow: any;
    let updateHandler: UpdateDocumentTypeHandler;
    let statusHandler: UpdateDocumentTypeStatusHandler;
    let docTypeA: DocumentTypeAggregate;

    beforeEach(() => {
      docTypeA = DocumentTypeAggregate.create(
        {
          businessId: 'DCT-001',
          companyId: 'company-a',
          name: 'Offer Letter',
          code: 'OFFER_LETTER',
          description: 'Original description',
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
        new Identifier<string>('dt-company-a'),
      );

      mockRepo = {
        findById: jest.fn(async (id: string) => (id === 'dt-company-a' ? docTypeA : null)),
        findByBusinessId: jest.fn(),
        findByCode: jest.fn(),
        save: jest.fn(async (dt: DocumentTypeAggregate) => {
          docTypeA = dt;
        }),
      };
      mockUow = { withTransaction: jest.fn(async (fn: () => any) => fn()) };

      updateHandler = new UpdateDocumentTypeHandler(mockRepo, mockUow);
      statusHandler = new UpdateDocumentTypeStatusHandler(mockRepo, mockUow);
    });

    it('should update name and description for valid tenant owner', async () => {
      const result = await updateHandler.execute(
        new UpdateDocumentTypeCommand('dt-company-a', 'company-a', 'Updated Offer Letter', 'New description', 'user-1'),
      );
      expect(result.isSuccess).toBe(true);
      expect(docTypeA.name).toBe('Updated Offer Letter');
      expect(docTypeA.description).toBe('New description');
    });

    it('should reject update if company does not match (tenant boundary protection)', async () => {
      const result = await updateHandler.execute(
        new UpdateDocumentTypeCommand('dt-company-a', 'company-b-intruder', 'Hacked Title', 'Hack', 'user-2'),
      );
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('not found');
      expect(docTypeA.name).toBe('Offer Letter');
    });

    it('should deactivate and reactivate document type for authorized tenant', async () => {
      // 1. Deactivate
      const deactivateResult = await statusHandler.execute(
        new UpdateDocumentTypeStatusCommand('dt-company-a', 'company-a', false, 'user-admin'),
      );
      expect(deactivateResult.isSuccess).toBe(true);
      expect(docTypeA.isActive).toBe(false);

      // 2. Reactivate
      const activateResult = await statusHandler.execute(
        new UpdateDocumentTypeStatusCommand('dt-company-a', 'company-a', true, 'user-admin'),
      );
      expect(activateResult.isSuccess).toBe(true);
      expect(docTypeA.isActive).toBe(true);
    });

    it('should reject status change if company does not match (tenant boundary protection)', async () => {
      const result = await statusHandler.execute(
        new UpdateDocumentTypeStatusCommand('dt-company-a', 'company-b-intruder', false, 'user-attacker'),
      );
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('not found');
      expect(docTypeA.isActive).toBe(true);
    });
  });

  describe('5. Future Document Generation Guard', () => {
    let mockDocTypeRepo: jest.Mocked<IDocumentTypeRepository>;
    let mockTemplateRepo: any;
    let mockDocRepo: any;
    let mockUow: any;
    let mockIdGen: any;
    let mockDomainService: any;
    let mockDispatcher: any;
    let mockDataProvider: any;
    let generateHandler: GenerateDocumentHandler;

    beforeEach(() => {
      mockDocTypeRepo = {
        findById: jest.fn(),
        findByBusinessId: jest.fn(),
        findByCode: jest.fn(),
        save: jest.fn(),
      };
      mockTemplateRepo = { findByDocumentTypeId: jest.fn() };
      mockDocRepo = { save: jest.fn() };
      mockUow = { withTransaction: jest.fn(async (fn: () => any) => fn()) };
      mockIdGen = { generate: jest.fn(async () => 'GDOC-001') };
      mockDomainService = { validateTemplateForGeneration: jest.fn() };
      mockDispatcher = { dispatchNow: jest.fn() };
      mockDataProvider = { getEmployeeData: jest.fn() };

      generateHandler = new GenerateDocumentHandler(
        mockDocTypeRepo,
        mockTemplateRepo,
        mockDocRepo,
        mockUow,
        mockIdGen,
        mockDomainService,
        mockDispatcher,
        mockDataProvider,
      );
    });

    it('should reject generation when document type is inactive', async () => {
      const inactiveDocType = DocumentTypeAggregate.create(
        {
          businessId: 'DCT-001',
          companyId: 'company-a',
          name: 'NOC',
          code: 'NOC',
          description: 'No Objection Certificate',
          isActive: false, // INACTIVE!
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
        new Identifier<string>('dt-noc'),
      );

      mockDocTypeRepo.findById.mockResolvedValueOnce(inactiveDocType);

      const command = new GenerateDocumentCommand(
        'company-a',
        'dt-noc',
        'EMPLOYEE',
        'emp-1',
        { actionId: 'action-1', initiatedBy: 'user-1' },
        'user-1',
      );

      const result = await generateHandler.execute(command);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('Cannot generate document: document type is inactive');
    });

    it('should reject generation when document type belongs to another tenant', async () => {
      const otherTenantDocType = DocumentTypeAggregate.create(
        {
          businessId: 'DCT-001',
          companyId: 'company-b', // Company B!
          name: 'Offer Letter',
          code: 'OFFER_LETTER',
          description: 'Company B Offer',
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
        new Identifier<string>('dt-comp-b'),
      );

      mockDocTypeRepo.findById.mockResolvedValueOnce(otherTenantDocType);

      // Company A user attempts to generate
      const command = new GenerateDocumentCommand(
        'company-a',
        'dt-comp-b',
        'EMPLOYEE',
        'emp-1',
        { actionId: 'action-2', initiatedBy: 'user-1' },
        'user-1',
      );

      const result = await generateHandler.execute(command);
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('not found');
    });
  });

  describe('6. Historical Generated Documents Compatibility', () => {
    it('historical generated documents continue to reference their DocumentType even when deactivated', () => {
      // Simulate historical document record
      const historicalDocument = {
        id: 'gdoc-1',
        businessId: 'GDOC-0001',
        companyId: 'company-a',
        documentTypeId: 'dt-offer-letter',
        profileId: 'emp-1',
        status: 'GENERATED',
        createdAt: new Date('2024-01-01'),
      };

      const docType = DocumentTypeAggregate.create(
        {
          businessId: 'DCT-001',
          companyId: 'company-a',
          name: 'Offer Letter',
          code: 'OFFER_LETTER',
          description: 'Historical offer',
          isActive: true,
          isDeleted: false,
          version: 1,
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
          createdBy: 'user-1',
          updatedBy: 'user-1',
        },
        new Identifier<string>('dt-offer-letter'),
      );

      // Deactivate the document type
      docType.deactivate('hr-admin');
      expect(docType.isActive).toBe(false);

      // Verify historical relationship remains valid and untouched
      expect(historicalDocument.documentTypeId).toBe(docType.id.toValue());
      expect(historicalDocument.status).toBe('GENERATED');
    });
  });

  describe('7. Query Handlers & Tenant Isolation', () => {
    let mockPrisma: any;
    let listHandler: ListDocumentTypesHandler;
    let getHandler: GetDocumentTypeHandler;

    beforeEach(() => {
      mockPrisma = {
        documentType: {
          count: jest.fn(),
          findMany: jest.fn(),
          findUnique: jest.fn(),
          upsert: jest.fn(),
        },
        company: {
          findUnique: jest.fn(),
        },
      };

      listHandler = new ListDocumentTypesHandler(mockPrisma);
      getHandler = new GetDocumentTypeHandler(mockPrisma);
    });

    it('ListDocumentTypesHandler should scope query strictly to companyId', async () => {
      mockPrisma.documentType.count.mockResolvedValueOnce(2);
      mockPrisma.documentType.findMany.mockResolvedValueOnce([
        {
          id: 'dt-1',
          businessId: 'DCT-001',
          companyId: 'company-a',
          name: 'Offer Letter',
          code: 'OFFER_LETTER',
          description: 'Offer',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { generatedDocs: 3, templates: 1 },
        },
      ]);

      const result = await listHandler.execute(new ListDocumentTypesQuery('company-a'));
      expect(result.isSuccess).toBe(true);

      const items = result.getValue();
      expect(items).toHaveLength(1);
      expect(items[0].companyId).toBe('company-a');
      expect(items[0].generatedDocumentsCount).toBe(3);

      expect(mockPrisma.documentType.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: 'company-a',
            isDeleted: false,
          }),
        }),
      );
    });

    it('GetDocumentTypeHandler should reject query if record belongs to another company', async () => {
      mockPrisma.documentType.findUnique.mockResolvedValueOnce({
        id: 'dt-comp-b',
        businessId: 'DCT-002',
        companyId: 'company-b', // BELONGS TO COMPANY B
        name: 'Relieving Letter',
        code: 'RELIEVING_LETTER',
        description: 'Exit',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { generatedDocs: 0, templates: 0 },
      });

      // User from Company A tries to get Company B's document type
      const result = await getHandler.execute(
        new GetDocumentTypeQuery('dt-comp-b', 'company-a'),
      );
      expect(result.isFailure).toBe(true);
      expect(result.errorValue).toContain('not found');
    });
  });
});
