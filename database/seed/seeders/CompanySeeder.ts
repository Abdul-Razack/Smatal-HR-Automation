import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';

export const DEMO_COMPANY_BUSINESS_ID = 'CMP-001';

export class CompanySeeder extends BaseSeeder {
  readonly name = 'CompanySeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (env.isProduction) {
      console.log(`  -> Skipping Demo Company creation in Production.`);
      return;
    }

    await prisma.company.upsert({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID },
      update: {},
      create: {
        businessId: DEMO_COMPANY_BUSINESS_ID,
        name: 'Smatal Demo Company',
        legalName: 'Smatal Demo Corporation LLC',
        code: 'SMATAL-DEMO',
        industry: 'Software',
        isActive: true,
        createdBy: env.systemUuid,
        updatedBy: env.systemUuid,
      },
    });

    console.log(`  -> Ensured Demo Company exists.`);
  }
}
