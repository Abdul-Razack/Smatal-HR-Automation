import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { DEMO_COMPANY_BUSINESS_ID } from './CompanySeeder';
import { FieldDataType, FieldEntityType } from '@prisma/client';

export class MasterDataSeeder extends BaseSeeder {
  readonly name = 'MasterDataSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (env.isProduction) {
      console.log(`  -> Skipping Demo Master Data in Production.`);
      return;
    }

    const company = await prisma.company.findUnique({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID }
    });

    if (!company) {
      throw new Error('Demo Company not found.');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Branch
      await tx.branch.upsert({
        where: { businessId: 'BRN-001' },
        update: {},
        create: {
          businessId: 'BRN-001',
          companyId: company.id,
          name: 'Headquarters',
          code: 'HQ',
          isActive: true,
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      // 2. Department
      await tx.department.upsert({
        where: { businessId: 'DPT-001' },
        update: {},
        create: {
          businessId: 'DPT-001',
          companyId: company.id,
          name: 'Engineering',
          code: 'ENG',
          isActive: true,
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      // 3. Designation
      await tx.designation.upsert({
        where: { businessId: 'DSG-001' },
        update: {},
        create: {
          businessId: 'DSG-001',
          companyId: company.id,
          name: 'Software Engineer',
          code: 'SWE',
          level: 3,
          isActive: true,
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      // 4. Document Types
      await tx.documentType.upsert({
        where: { businessId: 'DCT-001' },
        update: {},
        create: {
          businessId: 'DCT-001',
          companyId: company.id,
          code: 'OFFER_LETTER',
          name: 'Standard Offer Letter',
          isActive: true,
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      // 5. Dynamic Field
      await tx.fieldDefinition.upsert({
        where: { businessId: 'FLD-001' },
        update: {},
        create: {
          businessId: 'FLD-001',
          companyId: company.id,
          machineKey: 'LINKEDIN_URL',
          displayName: 'LinkedIn Profile URL',
          entityType: FieldEntityType.CANDIDATE,
          dataType: FieldDataType.TEXT,
          isRequired: false,
          isSystem: false,
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });
    });

    console.log(`  -> Seeded Master Data (Branch, Dept, Designation, DocType, Field).`);
  }
}
