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
      const fieldsToSeed = [
        { key: 'LINKEDIN_URL', name: 'LinkedIn Profile URL', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
        { key: 'JOB_TITLE', name: 'Job Title', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'EMPLOYMENT_TYPE', name: 'Employment Type', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'JOINING_DATE', name: 'Joining Date', type: FieldDataType.DATE, entity: FieldEntityType.EMPLOYEE },
        { key: 'REPORTING_TIME', name: 'Reporting Time', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'ANNUAL_CTC', name: 'Annual CTC', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'OFFER_EXPIRATION', name: 'Offer Expiration Date', type: FieldDataType.DATE, entity: FieldEntityType.CANDIDATE },
        { key: 'AUTH_SIGNATORY_NAME', name: 'Authorized Signatory Name', type: FieldDataType.TEXT, entity: FieldEntityType.PROFILE },
        { key: 'AUTH_SIGNATORY_TITLE', name: 'Authorized Signatory Title', type: FieldDataType.TEXT, entity: FieldEntityType.PROFILE },
        { key: 'OFFER_REF_NUM', name: 'Offer Reference Number', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
        { key: 'CANDIDATE_ADDRESS_1', name: 'Candidate Address Line 1', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
        { key: 'CANDIDATE_ADDRESS_2', name: 'Candidate Address Line 2', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
      ];

      for (let i = 0; i < fieldsToSeed.length; i++) {
        const field = fieldsToSeed[i];
        const businessId = `FLD-${String(i + 1).padStart(3, '0')}`;
        await tx.fieldDefinition.upsert({
          where: { businessId },
          update: {
            machineKey: field.key,
            displayName: field.name,
            entityType: field.entity,
            dataType: field.type,
          },
          create: {
            businessId,
            companyId: company.id,
            machineKey: field.key,
            displayName: field.name,
            entityType: field.entity,
            dataType: field.type,
            isRequired: false,
            isSystem: false,
            createdBy: env.systemUuid,
            updatedBy: env.systemUuid,
          },
        });
      }
    });

    console.log(`  -> Seeded Master Data (Branch, Dept, Designation, DocType, Field).`);
  }
}
