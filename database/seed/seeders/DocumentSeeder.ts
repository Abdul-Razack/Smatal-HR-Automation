import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { DEMO_COMPANY_BUSINESS_ID } from './CompanySeeder';
import { TemplateStatus, TemplateVersionStatus } from '@prisma/client';

export class DocumentSeeder extends BaseSeeder {
  readonly name = 'DocumentSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (env.isProduction) {
      console.log(`  -> Skipping Demo Documents in Production.`);
      return;
    }

    const company = await prisma.company.findUnique({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID }
    });

    const docType = await prisma.documentType.findUnique({
      where: { businessId: 'DCT-001' }
    });

    if (!company || !docType) {
      throw new Error('Demo Company or Document Type not found.');
    }

    await prisma.template.upsert({
      where: { businessId: 'TMP-001' },
      update: {},
      create: {
        businessId: 'TMP-001',
        companyId: company.id,
        documentTypeId: docType.id,
        name: 'Base Engineer Offer',
        description: 'Standard software engineer offer template',
        status: TemplateStatus.PUBLISHED,
        createdBy: env.systemUuid,
        updatedBy: env.systemUuid,
        versions: {
          create: {
            businessId: 'TMV-001',
            versionNumber: 1,
            content: '<h1>Offer Letter</h1><p>Dear {firstName}, we are pleased to offer you the position of {designation}.</p>',
            status: TemplateVersionStatus.PUBLISHED,
            createdBy: env.systemUuid,
            updatedBy: env.systemUuid,
          }
        }
      }
    });

    console.log(`  -> Seeded Default Document Templates.`);
  }
}
